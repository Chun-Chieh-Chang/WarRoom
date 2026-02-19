/**
 * Represents a change that can be applied to an Asset.
 * Actions are the "Energy" input into the system.
 */
export interface Action<P = unknown> {
  type: string;
  payload: P;
  timestamp: number;
}
