const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  validateArchive: (filePath) => ipcRenderer.invoke('validate-archive', filePath),
  
  extractArchive: (filePath, outputPath) => ipcRenderer.invoke('extract-archive', filePath, outputPath),
  
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // CLI execution
  executeCLI: (command, args, options) => ipcRenderer.invoke('execute-cli', command, args, options),
  
  cancelCLI: (processId) => ipcRenderer.invoke('cancel-cli', processId),
  
  // Progress monitoring
  onProgress: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('progress', subscription);
    
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('progress', subscription);
    };
  },
  
  onCLIOutput: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('cli-output', subscription);
    
    return () => {
      ipcRenderer.removeListener('cli-output', subscription);
    };
  },
  
  onCLIError: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('cli-error', subscription);
    
    return () => {
      ipcRenderer.removeListener('cli-error', subscription);
    };
  },
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Path utilities
  getPaths: () => ipcRenderer.invoke('get-paths'),
  
  // Environment detection
  isElectron: true,
  platform: process.platform,
  arch: process.arch
});

// Log when preload script is loaded
console.log('🦅 Flock Native - Preload script loaded');
console.log(`📦 Electron API exposed to renderer process`);

