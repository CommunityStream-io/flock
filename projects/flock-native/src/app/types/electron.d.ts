/**
 * TypeScript definitions for Electron API exposed via preload script
 */

export interface FileSelectionResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  lastModified?: Date;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  fileSize?: number;
  filePath?: string;
  field?: string;
  value?: any;
}

export interface ExtractionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export interface FileReadResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface CLIExecutionResult {
  success: boolean;
  processId?: string;
  pid?: number;
  error?: string;
}

export interface CLICancellationResult {
  success: boolean;
  error?: string;
}

export interface ProgressData {
  type: 'extraction' | 'validation' | 'migration' | 'custom';
  status: 'starting' | 'progress' | 'complete' | 'error';
  message: string;
  percentage?: number;
  outputPath?: string;
  filePath?: string;
  targetPath?: string;
  filesProcessed?: number;
  totalFiles?: number;
  duration?: string;
}

export interface CLIOutputData {
  processId: string;
  type: 'stdout' | 'stderr' | 'exit' | 'error';
  data?: string;
  code?: number;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  homedir: string;
  tmpdir: string;
  cpus: number;
  totalmem: number;
  freemem: number;
}

export interface PathsInfo {
  home: string;
  appData: string;
  userData: string;
  temp: string;
  downloads: string;
  documents: string;
  desktop: string;
}

export interface CLIOptions {
  cwd?: string;
  env?: Record<string, string>;
}

/**
 * Electron API interface exposed via contextBridge
 */
export interface ElectronAPI {
  // File operations
  selectFile(): Promise<FileSelectionResult>;
  validateArchive(filePath: string): Promise<ValidationResult>;
  extractArchive(filePath: string, outputPath?: string): Promise<ExtractionResult>;
  readFile(filePath: string): Promise<FileReadResult>;
  
  // CLI execution (using utilityProcess.fork)
  executeCLI(options?: CLIOptions): Promise<CLIExecutionResult>;
  cancelCLI(processId: string): Promise<CLICancellationResult>;
  
  // Progress monitoring
  onProgress(callback: (data: ProgressData) => void): () => void;
  onCLIOutput(callback: (data: CLIOutputData) => void): () => void;
  onCLIError(callback: (data: CLIOutputData) => void): () => void;
  
  // System information
  getSystemInfo(): Promise<SystemInfo>;
  getPaths(): Promise<PathsInfo>;
  
  // Environment detection
  isElectron: boolean;
  platform: string;
  arch: string;
}

/**
 * Extend the Window interface to include the Electron API
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

