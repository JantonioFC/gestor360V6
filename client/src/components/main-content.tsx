import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarkdownEditor from "./markdown-editor";
import MarkdownPreview from "./markdown-preview";
import type { Document } from "@shared/schema";
import { Edit, Eye, Columns, Save, Info } from "lucide-react";

interface MainContentProps {
  selectedDocument: Document | null;
  currentView: "editor" | "preview" | "kanban";
  onViewChange: (view: "editor" | "preview" | "kanban") => void;
  onDocumentUpdate: (document: Document) => void;
}

export default function MainContent({
  selectedDocument,
  currentView,
  onViewChange,
  onDocumentUpdate,
}: MainContentProps) {
  if (!selectedDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--dark-primary)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Bienvenido a Gestor 360
          </h2>
          <p className="text-[var(--text-secondary)]">
            Selecciona un documento de la barra lateral para comenzar a editar
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--dark-primary)]">
      {/* Header */}
      <div className="bg-[var(--dark-secondary)] border-b border-[var(--border-dark)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">
            {selectedDocument.title}
          </h2>
          <div className="flex items-center space-x-2">
            <Badge className="bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
              {selectedDocument.folder}
            </Badge>
            <span className="text-[var(--text-secondary)] text-sm">
              Modificado {formatDate(selectedDocument.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="bg-[var(--dark-tertiary)] rounded-md p-1 flex">
            <Button
              variant={currentView === "editor" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1.5 text-sm ${
                currentView === "editor" 
                  ? 'bg-[var(--accent-blue)] text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => onViewChange("editor")}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editor
            </Button>
            <Button
              variant={currentView === "preview" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1.5 text-sm ${
                currentView === "preview" 
                  ? 'bg-[var(--accent-blue)] text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => onViewChange("preview")}
            >
              <Eye className="h-3 w-3 mr-1" />
              Vista
            </Button>
            <Button
              variant={currentView === "kanban" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1.5 text-sm ${
                currentView === "kanban" 
                  ? 'bg-[var(--accent-blue)] text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => onViewChange("kanban")}
            >
              <Columns className="h-3 w-3 mr-1" />
              Kanban
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-[var(--dark-tertiary)]"
          >
            <Save className="h-4 w-4 text-green-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-[var(--dark-tertiary)]"
          >
            <Info className="h-4 w-4 text-[var(--text-secondary)]" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {currentView === "editor" && (
          <>
            <div className="flex-1">
              <MarkdownEditor
                document={selectedDocument}
                onDocumentUpdate={onDocumentUpdate}
              />
            </div>
            <div className="w-1/2 border-l border-[var(--border-dark)]">
              <MarkdownPreview content={selectedDocument.content} />
            </div>
          </>
        )}

        {currentView === "preview" && (
          <div className="flex-1">
            <MarkdownPreview content={selectedDocument.content} />
          </div>
        )}
      </div>
    </div>
  );
}
