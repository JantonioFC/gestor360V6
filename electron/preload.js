const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Operaciones de documentos
  getFolders: () => ipcRenderer.invoke('get-folders'),
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  createDocument: (documentData) => ipcRenderer.invoke('create-document', documentData),
  updateDocument: (data) => ipcRenderer.invoke('update-document', data),
  searchDocuments: (query) => ipcRenderer.invoke('search-documents', query),
  
  // Operaciones de Git
  gitSync: () => ipcRenderer.invoke('git-sync'),
  setupGitHubRepo: () => ipcRenderer.invoke('setup-github-repo'),
  
  // Utilidades del sistema
  openDocumentsFolder: () => ipcRenderer.invoke('open-documents-folder'),
  
  // Eventos
  onFileChanged: (callback) => {
    ipcRenderer.on('file-changed', callback);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Información del sistema
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  version: process.versions.electron,
  isElectron: true
});