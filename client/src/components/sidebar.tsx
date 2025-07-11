import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Document, Folder } from "@shared/schema";
import { Search, FolderSync, Plus, ChevronRight, ChevronDown, Folder as FolderIcon, File } from "lucide-react";

interface SidebarProps {
  folders: Folder[];
  documents: Document[];
  selectedFolder: string;
  selectedDocument: Document | null;
  searchQuery: string;
  onFolderSelect: (folder: string) => void;
  onDocumentSelect: (document: Document) => void;
  onNewEntry: () => void;
  onSearch: (query: string) => void;
}

export default function Sidebar({
  folders,
  documents,
  selectedFolder,
  selectedDocument,
  searchQuery,
  onFolderSelect,
  onDocumentSelect,
  onNewEntry,
  onSearch,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([selectedFolder]));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/git/sync"),
    onSuccess: () => {
      toast({
        title: "Sincronización exitosa",
        description: "Los cambios se han sincronizado con Git correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar con Git. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getDocumentsByFolder = (folderPath: string) => {
    return documents.filter(doc => doc.folder === folderPath);
  };

  return (
    <div className="w-72 bg-[var(--dark-secondary)] border-r border-[var(--border-dark)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-dark)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-white">Gestor 360</h1>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-[var(--accent-blue)] hover:bg-[var(--dark-tertiary)]"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <FolderSync className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <Input
            type="text"
            placeholder="Buscar archivos..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-[var(--dark-tertiary)] border-[var(--border-dark)] text-[var(--text-primary)] focus:border-[var(--accent-blue)]"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {folders.map((folder) => {
            const folderDocuments = getDocumentsByFolder(folder.path);
            const isExpanded = expandedFolders.has(folder.path);
            const isSelected = selectedFolder === folder.path;

            return (
              <div key={folder.id} className="space-y-1">
                <div
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer group transition-colors ${
                    isSelected ? 'bg-[var(--dark-tertiary)]' : 'hover:bg-[var(--dark-tertiary)]'
                  }`}
                  onClick={() => {
                    toggleFolder(folder.path);
                    onFolderSelect(folder.path);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-[var(--text-primary)] mr-2" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] mr-2" />
                  )}
                  <FolderIcon className="h-4 w-4 text-[var(--accent-blue)] mr-3" />
                  <span className="text-sm font-medium flex-1">{folder.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {folderDocuments.length}
                  </span>
                </div>

                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {folderDocuments.map((document) => (
                      <div
                        key={document.id}
                        className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                          selectedDocument?.id === document.id
                            ? 'bg-[var(--accent-blue)]/20 border-l-2 border-[var(--accent-blue)] text-[var(--accent-blue)]'
                            : 'hover:bg-[var(--dark-tertiary)] text-[var(--text-primary)]'
                        }`}
                        onClick={() => onDocumentSelect(document)}
                      >
                        <File className="h-3 w-3 mr-3 text-[var(--text-secondary)]" />
                        <span className="truncate">{document.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-dark)]">
        <Button
          onClick={onNewEntry}
          className="w-full bg-[var(--accent-blue)] hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Entrada
        </Button>

        <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>● Sincronizado</span>
          <span>Hace 2 min</span>
        </div>
      </div>
    </div>
  );
}
