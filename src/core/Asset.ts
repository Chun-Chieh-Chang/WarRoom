/**
 * The fundamental atom of the Compound System.
 * An Asset is anything that can accumulate value over time.
 */
export interface Asset<T> {
  id: string;
  type: string;
  value: T;
  version: number;
  
  /**
   * Apply a transformation to this asset, returning a new version.
   * This ensures immutability where possible.
   */
  apply(action: unknown): Asset<T>;
}
