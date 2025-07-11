import { users, documents, folders, type User, type InsertUser, type Document, type InsertDocument, type Folder, type InsertFolder } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByFilename(filename: string): Promise<Document | undefined>;
  getDocumentsByFolder(folder: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Folder operations
  getFolders(): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private folders: Map<number, Folder>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentFolderId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.folders = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentFolderId = 1;
    
    // Initialize default folders
    this.initializeDefaultFolders();
    this.initializeSampleDocuments();
  }

  private initializeDefaultFolders() {
    const defaultFolders: InsertFolder[] = [
      { name: "DDE (Documentos de Decisión)", path: "dde", icon: "fas fa-lightbulb" },
      { name: "Planificación", path: "planificacion", icon: "fas fa-calendar-alt" },
      { name: "Retrospectivas", path: "retrospectivas", icon: "fas fa-history" },
      { name: "Notas", path: "notas", icon: "fas fa-sticky-note" },
    ];
    
    defaultFolders.forEach(folder => this.createFolder(folder));
  }

  private initializeSampleDocuments() {
    const sampleDoc: InsertDocument = {
      title: "Sprint Planning Q1",
      content: `# Sprint Planning Q1 2024

## Objetivos del Sprint
- [ ] Implementar nueva funcionalidad de autenticación
- [ ] Optimizar rendimiento de la base de datos
- [x] Configurar pipeline de CI/CD

## Por hacer
- Revisión de código pendiente
- Documentación de API
- Testing de integración

## En proceso
- Desarrollo de componentes UI
- Implementación de cache Redis

## Hecho
- Setup del entorno de desarrollo
- Configuración de monitoreo
- Diseño de base de datos`,
      folder: "planificacion",
      filename: `Sprint_Planning_Q1_${new Date().toISOString().slice(0, 10)}.md`
    };
    
    this.createDocument(sampleDoc);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByFilename(filename: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(doc => doc.filename === filename);
  }

  async getDocumentsByFolder(folder: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.folder === folder);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument: Document = {
      ...document,
      ...updateData,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = { ...insertFolder, id };
    this.folders.set(id, folder);
    return folder;
  }
}

export const storage = new MemStorage();
