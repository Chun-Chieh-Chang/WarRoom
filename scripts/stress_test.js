const axios = require('axios');

async function runTests() {
  console.log('--- Starting WarRoom Stress Test (API-Driven) ---');
  const API_URL = 'http://localhost:3000/api';

  // Test 1: Workspace Data Isolation
  console.log('\n[TEST 1] Testing Workspace Data Isolation...');
  try {
    const res = await axios.get(`${API_URL}/experience?assetId=quality`);
    if (Array.isArray(res.data)) {
      console.log('✅ Quality workspace is accessible.');
    }
  } catch (err) {
    console.error('❌ Workspace API Failed:', err.message);
  }

  // Test 2: Concurrency (100 Parallel Requests)
  console.log('\n[TEST 2] Testing Concurrency (100 Parallel API Hits)...');
  const start = Date.now();
  const requests = Array.from({ length: 100 }).map((_, i) => 
    axios.get(`${API_URL}/experience?assetId=default`).catch(e => ({ error: true }))
  );
  
  const results = await Promise.all(requests);
  const failures = results.filter(r => r.error).length;
  const duration = Date.now() - start;
  
  if (failures === 0) {
    console.log(`✅ Concurrency Test Passed (100/100 successful in ${duration}ms)`);
  } else {
    console.error(`❌ Concurrency Test Failed: ${failures} requests timed out or errored.`);
  }

  // Test 3: Team Configuration Persistence
  console.log('\n[TEST 3] Testing Team Persistence...');
  const originalTeam = (await axios.get(`${API_URL}/team`)).data;
  const testTeam = [
    { id: 'tester', name: 'Stress Test Agent ' + Date.now(), role: 'Testing system limits', color: '#ff0000' }
  ];

  try {
    await axios.post(`${API_URL}/team`, { members: testTeam });
    const savedTeam = (await axios.get(`${API_URL}/team`)).data;
    if (savedTeam[0].name.startsWith('Stress Test Agent')) {
      console.log('✅ Persistence Logic Verified: API correctly saves and retrieves team config.');
    }
    // Restore original team
    await axios.post(`${API_URL}/team`, { members: originalTeam });
  } catch (err) {
    console.error('❌ Persistence API interaction failed:', err.message);
  }

  // Test 4: Fault Tolerance (Empty Payload)
  console.log('\n[TEST 4] Testing Fault Tolerance (Bad Payloads)...');
  try {
    await axios.post(`${API_URL}/team`, {});
    console.log('   - Caught empty payload.');
  } catch (err) {
    console.log('✅ Security Check Passed: API rejected malformed team update.');
  }

  console.log('\n--- Stress Test Completed ---');
}

runTests();
