import express from 'express';
import cors from 'cors';
import { SqliteStore } from './lib/SqliteStore';
import fs from 'fs';
import path from 'path';

import { FlywheelController } from './FlywheelController';
import { OllamaProvider } from './lib/providers/OllamaProvider';

const app = express();
const port = 3000;
const store = new SqliteStore('./data/system.db');
const ai = new OllamaProvider();

app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

import { BrainstormingController, TeamMember } from './BrainstormingController';

// Default AI Team Configuration
let currentTeam: TeamMember[] = [
  { id: 'ai-mold', name: '模具工程部主管', role: '負責模具設計審查、開模可行性評估與技術問題解決', color: '#ff9900' }, // Orange
  { id: 'ai-qa', name: '品保部主管', role: '專注於風險管控、品質標準、良率控制與客訴預防', color: '#00ccff' }, // Light Blue
  { id: 'ai-sales', name: '業務部主管', role: '負責客戶需求釐清、訂單交期協調與市場反饋', color: '#66ff66' }  // Light Green
];

/**
 * API: Get Current Team
 */
app.get('/api/team', (req, res) => {
  res.json(currentTeam);
});

/**
 * API: Update Team
 */
app.post('/api/team', (req, res) => {
  const { members } = req.body;
  if (Array.isArray(members)) {
    currentTeam = members;
    res.json({ success: true, message: '團隊成員已更新' });
  } else {
    res.status(400).json({ error: '無效的成員清單' });
  }
});

/**
 * API: Clear History
 */
app.post('/api/history/clear', (req, res) => {
  try {
    store.clearActions();
    res.json({ success: true, message: '歷史紀錄已清除' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * API: Brainstorm Stream (SSE)
 */
// Brainstorming session state management
const activeSessions = new Map<string, { topic: string, currentGoal: string }>();

app.get('/api/brainstorm-stream', async (req, res) => {
  const topic = req.query.topic as string || '如何提升複利系統的用戶參與度？';
  const goal = req.query.context as string || '';
  const sessionId = req.query.sessionId as string || 'default';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  activeSessions.set(sessionId, { topic, currentGoal: goal });

  const send = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const controller = new BrainstormingController(store, ai);
    await controller.executeMultiRoundSession(
      topic, 
      goal, 
      currentTeam, 
      (progress) => send(progress),
      () => activeSessions.get(sessionId)?.currentGoal || goal
    );
    activeSessions.delete(sessionId);
    res.end();
  } catch (error: any) {
    send({ type: 'ERROR', message: error.message });
    res.end();
  }
});

app.post('/api/brainstorm/goal', (req, res) => {
  const { sessionId, goal } = req.body;
  if (!sessionId || !goal) return res.status(400).json({ error: 'Missing sessionId or goal' });
  
  if (activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)!;
    session.currentGoal = goal;
    res.json({ success: true, message: '目標已更新' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

/**
 * API: Trigger a flywheel tick (Streaming SSE)
 */
app.get('/api/tick-stream', async (req, res) => {
  const assetId = req.query.assetId as string || 'main-growth-asset';
  const userDirective = req.query.directive as string || '';

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendProgress = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const controller = new FlywheelController(store, ai, assetId);
    await controller.tick((progress) => {
      sendProgress(progress);
    }, userDirective);
    // Final end signal
    sendProgress({ type: 'COMPLETE', message: '飛輪週期執行成功' });
    res.end();
  } catch (error: any) {
    console.error('Tick Stream Error:', error);
    sendProgress({ type: 'ERROR', message: error.message });
    res.end();
  }
});

/**
 * API: Legacy Trigger (Non-streaming)
 */
app.post('/api/tick', async (req, res) => {
  const { assetId } = req.body;
  const targetId = assetId || 'main-growth-asset';

  try {
    const controller = new FlywheelController(store, ai, targetId);
    await controller.tick();
    res.json({ success: true, message: '飛輪週期執行成功' });
  } catch (error: any) {
    console.error('Tick Error:', error);
    res.status(500).json({ error: '飛輪執行失敗', details: error.message });
  }
});

/**
 * API: Create or Reset a targeting asset
 */
app.post('/api/targets', async (req, res) => {
  const { id, name, initialValue, target } = req.body;
  
  if (!id || !name || initialValue === undefined) {
    return res.status(400).json({ error: '缺少必要欄位 (id, name, initialValue)' });
  }

  try {
    const asset = {
      id,
      type: 'GROWTH',
      value: Number(initialValue),
      version: 1,
      name,
      target: Number(target) || 0
    };

    // Save as primary growth asset
    store.save(id, 'GROWTH', asset, 1);
    
    // Log the creation
    store.logAction(id, 'INITIAL_SETTLEMENT', { name }, 0, asset.value);

    res.json({ success: true, message: `新標的「${name}」已建立` });
  } catch (error: any) {
    res.status(500).json({ error: '建立標的失敗', details: error.message });
  }
});

/**
 * API: Get all assets for visualization
 */
app.get('/api/assets', (req, res) => {
  try {
    const assets = store.listByType('GROWTH');
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

/**
 * API: Get experience logs
 */
app.get('/api/experience', (req, res) => {
  try {
    const experiences = store.getRecentExperiences(10);
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

/**
 * API: Get detailed action audit log
 */
app.get('/api/actions', (req, res) => {
  try {
    const actions = store.getActions(50);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

/**
 * API: Get latest system constitution
 */
app.get('/api/constitution', (req, res) => {
  try {
    const constitution = store.getLatestConstitution();
    res.json(constitution || { principles: '尚未進行智慧提煉', version: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constitution' });
  }
});

/**
 * API: Get user guide
 */
app.get('/api/guide', (req, res) => {
  try {
    const guidePath = path.join(__dirname, '../docs/USER_GUIDE.md');
    const content = fs.readFileSync(guidePath, 'utf8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: '無法讀取指南文件' });
  }
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, 'web')));

app.listen(port, () => {
  console.log(`--- Compound Effect Dashboard Server ---`);
  console.log(`URL: http://localhost:${port}`);
  console.log(`Press Ctrl+C to stop`);
});
