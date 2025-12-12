/**
 * Re-export SplashIPC from common types
 * This file exists for backward compatibility with renderer code.
 * The source of truth is src/common/types/splashIPC.ts
 */
export type { SplashIPC } from '../../../src/common/types/splashIPC';

// Re-export the global Window interface extension
export {};
