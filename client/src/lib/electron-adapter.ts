// Adaptador para funcionar tanto en Electron como en el navegador web
import type { Document, Folder, InsertDocument } from "@shared/schema";

// Verificar si estamos ejecutando en Electron
const isElectron = () => {
  return typeof window !== 'undefined' && 
         window.electronAPI !== undefined &&
         window.systemInfo?.isElectron === true;
};

// Interfaz común para ambos entornos
interface DocumentAPI {
  getFolders(): Promise<Folder[]>;
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(filename: string, folder: string, content: string): Promise<Document>;
  searchDocuments(query: string): Promise<Document[]>;
  gitSync(): Promise<{ message: string; timestamp: string; status: string }>;
  openDocumentsFolder?(): Promise<void>;
  setupGitHubRepo?(): Promise<number>;
}

// Implementación para Electron
class ElectronDocumentAPI implements DocumentAPI {
  async getFolders(): Promise<Folder[]> {
    return window.electronAPI.getFolders();
  }

  async getDocuments(): Promise<Document[]> {
    return window.electronAPI.getDocuments();
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    return window.electronAPI.createDocument(document);
  }

  async updateDocument(filename: string, folder: string, content: string): Promise<Document> {
    return window.electronAPI.updateDocument({ filename, folder, content });
  }

  async searchDocuments(query: string): Promise<Document[]> {
    return window.electronAPI.searchDocuments(query);
  }

  async gitSync(): Promise<{ message: string; timestamp: string; status: string }> {
    return window.electronAPI.gitSync();
  }

  async openDocumentsFolder(): Promise<void> {
    return window.electronAPI.openDocumentsFolder();
  }

  async setupGitHubRepo(): Promise<number> {
    return window.electronAPI.setupGitHubRepo();
  }
}

// Implementación para navegador web (usando la API existente)
class WebDocumentAPI implements DocumentAPI {
  private async apiRequest(method: string, endpoint: string, data?: any): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }

  async getFolders(): Promise<Folder[]> {
    const response = await this.apiRequest('GET', '/api/folders');
    return response.json();
  }

  async getDocuments(): Promise<Document[]> {
    const response = await this.apiRequest('GET', '/api/documents');
    return response.json();
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const response = await this.apiRequest('POST', '/api/documents', document);
    return response.json();
  }

  async updateDocument(filename: string, folder: string, content: string): Promise<Document> {
    // En la versión web, necesitamos encontrar el documento por filename
    const documents = await this.getDocuments();
    const doc = documents.find(d => d.filename === filename && d.folder === folder);
    
    if (!doc) {
      throw new Error('Document not found');
    }

    const response = await this.apiRequest('PATCH', `/api/documents/${doc.id}`, { content });
    return response.json();
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const response = await this.apiRequest('GET', `/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }

  async gitSync(): Promise<{ message: string; timestamp: string; status: string }> {
    const response = await this.apiRequest('POST', '/api/git/sync');
    return response.json();
  }
}

// Singleton para la API de documentos
export const documentAPI: DocumentAPI = isElectron() ? new ElectronDocumentAPI() : new WebDocumentAPI();

// Utilidades adicionales solo para Electron
export const electronUtils = {
  isElectron,
  onFileChanged: (callback: (event: any, filePath: string) => void) => {
    if (isElectron() && window.electronAPI.onFileChanged) {
      window.electronAPI.onFileChanged(callback);
    }
  },
  removeAllListeners: (channel: string) => {
    if (isElectron() && window.electronAPI.removeAllListeners) {
      window.electronAPI.removeAllListeners(channel);
    }
  },
  getPlatform: () => {
    return isElectron() ? window.systemInfo?.platform : 'web';
  }
};

// Tipos para TypeScript
declare global {
  interface Window {
    electronAPI?: {
      getFolders: () => Promise<Folder[]>;
      getDocuments: () => Promise<Document[]>;
      createDocument: (document: InsertDocument) => Promise<Document>;
      updateDocument: (data: { filename: string; folder: string; content: string }) => Promise<Document>;
      searchDocuments: (query: string) => Promise<Document[]>;
      gitSync: () => Promise<{ message: string; timestamp: string; status: string }>;
      openDocumentsFolder: () => Promise<void>;
      setupGitHubRepo: () => Promise<number>;
      onFileChanged: (callback: (event: any, filePath: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    systemInfo?: {
      platform: string;
      version: string;
      isElectron: boolean;
    };
  }
}