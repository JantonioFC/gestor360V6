import { apiRequest } from "./queryClient";
import type { Document, InsertDocument } from "@shared/schema";

export class FileService {
  static async getAllDocuments(): Promise<Document[]> {
    const response = await apiRequest("GET", "/api/documents");
    return await response.json();
  }

  static async getDocument(id: number): Promise<Document> {
    const response = await apiRequest("GET", `/api/documents/${id}`);
    return await response.json();
  }

  static async getDocumentsByFolder(folder: string): Promise<Document[]> {
    const response = await apiRequest("GET", `/api/documents/folder/${folder}`);
    return await response.json();
  }

  static async createDocument(document: InsertDocument): Promise<Document> {
    const response = await apiRequest("POST", "/api/documents", document);
    return await response.json();
  }

  static async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document> {
    const response = await apiRequest("PATCH", `/api/documents/${id}`, updates);
    return await response.json();
  }

  static async deleteDocument(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/documents/${id}`);
  }

  static async searchDocuments(query: string): Promise<Document[]> {
    const response = await apiRequest("GET", `/api/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  }
}
