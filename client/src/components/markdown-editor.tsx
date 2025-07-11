import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

interface MarkdownEditorProps {
  document: Document;
  onDocumentUpdate: (document: Document) => void;
}

export default function MarkdownEditor({ document, onDocumentUpdate }: MarkdownEditorProps) {
  const [content, setContent] = useState(document.content);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setContent(document.content);
  }, [document.content]);

  const saveDocumentMutation = useMutation({
    mutationFn: (updatedContent: string) => 
      apiRequest("PATCH", `/api/documents/${document.id}`, {
        content: updatedContent,
      }),
    onSuccess: async (response) => {
      const updatedDocument = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      onDocumentUpdate(updatedDocument);
      toast({
        title: "Documento guardado",
        description: "Los cambios se han guardado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleSave = useCallback(() => {
    if (content !== document.content) {
      saveDocumentMutation.mutate(content);
    }
  }, [content, document.content, saveDocumentMutation]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content !== document.content && content.trim()) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [content, document.content, handleSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="p-6 h-full">
      <Textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Escribe tu contenido en Markdown..."
        className="w-full h-full bg-[var(--dark-primary)] border-[var(--border-dark)] rounded-lg p-4 text-[var(--text-primary)] font-mono text-sm resize-none focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]"
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '14px',
          lineHeight: '1.5',
          minHeight: '100%',
        }}
      />
      
      {content !== document.content && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-[var(--dark-secondary)] border border-[var(--border-dark)] rounded-lg px-3 py-2 shadow-lg">
            <span className="text-xs text-[var(--text-secondary)]">
              Cambios sin guardar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
