import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all folders
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching folders" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  // Get documents by folder
  app.get("/api/documents/folder/:folder", async (req, res) => {
    try {
      const { folder } = req.params;
      const documents = await storage.getDocumentsByFolder(folder);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents by folder" });
    }
  });

  // Get specific document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error fetching document" });
    }
  });

  // Create new document
  app.post("/api/documents", async (req, res) => {
    try {
      const validation = insertDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validation.error.errors });
      }
      
      const document = await storage.createDocument(validation.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Error creating document" });
    }
  });

  // Update document
  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertDocumentSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validation.error.errors });
      }
      
      const document = await storage.updateDocument(id, validation.data);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error updating document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  // Search documents
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const documents = await storage.getDocuments();
      const searchQuery = q.toLowerCase();
      const results = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery) || 
        doc.content.toLowerCase().includes(searchQuery)
      );
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error searching documents" });
    }
  });

  // Git sync endpoint (mock implementation)
  app.post("/api/git/sync", async (req, res) => {
    try {
      // This would integrate with simple-git in a real implementation
      // For now, we'll simulate a successful sync
      setTimeout(() => {
        res.json({ 
          message: "Sincronización exitosa", 
          timestamp: new Date().toISOString(),
          status: "success" 
        });
      }, 1000);
    } catch (error) {
      res.status(500).json({ message: "Error during Git synchronization" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
