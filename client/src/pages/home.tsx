import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import MainContent from "@/components/main-content";
import NewEntryModal from "@/components/new-entry-modal";
import KanbanView from "@/components/kanban-view";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { documentAPI, electronUtils } from "@/lib/electron-adapter";
import type { Document, Folder } from "@shared/schema";

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("planificacion");
  const [currentView, setCurrentView] = useState<"editor" | "preview" | "kanban">("editor");
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: () => documentAPI.getFolders(),
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => documentAPI.getDocuments(),
  });

  const { data: searchResults = [] } = useQuery<Document[]>({
    queryKey: ["search", searchQuery],
    queryFn: () => documentAPI.searchDocuments(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const filteredDocuments = searchQuery.length > 2 ? searchResults : documents;

  // Configurar listener para cambios de archivos en Electron
  useEffect(() => {
    if (electronUtils.isElectron()) {
      const handleFileChange = () => {
        // Refrescar documentos cuando cambie un archivo
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      };

      electronUtils.onFileChanged(handleFileChange);

      return () => {
        electronUtils.removeAllListeners('file-changed');
      };
    }
  }, []);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setSelectedFolder(document.folder);
  };

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    // Clear selected document when switching folders
    if (selectedDocument && selectedDocument.folder !== folder) {
      setSelectedDocument(null);
    }
  };

  if (currentView === "kanban" && selectedDocument) {
    return (
      <KanbanView
        document={selectedDocument}
        onClose={() => setCurrentView("editor")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[var(--dark-primary)] text-[var(--text-primary)]">
      <Sidebar
        folders={folders}
        documents={filteredDocuments}
        selectedFolder={selectedFolder}
        selectedDocument={selectedDocument}
        searchQuery={searchQuery}
        onFolderSelect={handleFolderSelect}
        onDocumentSelect={handleDocumentSelect}
        onNewEntry={() => setIsNewEntryModalOpen(true)}
        onSearch={setSearchQuery}
      />
      
      <MainContent
        selectedDocument={selectedDocument}
        currentView={currentView}
        onViewChange={setCurrentView}
        onDocumentUpdate={setSelectedDocument}
      />

      <NewEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        selectedFolder={selectedFolder}
        onDocumentCreated={handleDocumentSelect}
      />
    </div>
  );
}
