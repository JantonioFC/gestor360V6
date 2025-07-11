import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document } from "@shared/schema";
import { X, User } from "lucide-react";

interface KanbanItem {
  id: string;
  content: string;
  priority?: "alta" | "media" | "baja";
  assignee?: string;
  progress?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
}

interface KanbanViewProps {
  document: Document;
  onClose: () => void;
}

export default function KanbanView({ document, onClose }: KanbanViewProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  useEffect(() => {
    parseMarkdownToKanban(document.content);
  }, [document.content]);

  const parseMarkdownToKanban = (markdown: string) => {
    const lines = markdown.split('\n');
    const kanbanColumns: KanbanColumn[] = [];
    let currentColumn: KanbanColumn | null = null;
    let itemId = 0;

    for (const line of lines) {
      // Check for h2 headers that indicate Kanban columns
      if (line.startsWith('## ') && (
        line.toLowerCase().includes('por hacer') ||
        line.toLowerCase().includes('todo') ||
        line.toLowerCase().includes('en proceso') ||
        line.toLowerCase().includes('in progress') ||
        line.toLowerCase().includes('doing') ||
        line.toLowerCase().includes('hecho') ||
        line.toLowerCase().includes('done') ||
        line.toLowerCase().includes('completado')
      )) {
        const title = line.replace('## ', '');
        const color = getColumnColor(title);
        currentColumn = {
          id: title.toLowerCase().replace(/\s+/g, '-'),
          title,
          color,
          items: []
        };
        kanbanColumns.push(currentColumn);
      }
      // Parse list items as Kanban cards
      else if (currentColumn && line.trim().startsWith('- ')) {
        const content = line.replace(/^- /, '').trim();
        if (content) {
          currentColumn.items.push({
            id: `item-${itemId++}`,
            content,
            priority: getPriorityFromContent(content),
            assignee: getAssigneeFromContent(content),
          });
        }
      }
    }

    // If no Kanban structure found, create default columns
    if (kanbanColumns.length === 0) {
      setColumns([
        {
          id: 'todo',
          title: 'Por hacer',
          color: 'red',
          items: []
        },
        {
          id: 'doing',
          title: 'En proceso',
          color: 'yellow',
          items: []
        },
        {
          id: 'done',
          title: 'Hecho',
          color: 'green',
          items: []
        }
      ]);
    } else {
      setColumns(kanbanColumns);
    }
  };

  const getColumnColor = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('por hacer') || lowerTitle.includes('todo')) return 'red';
    if (lowerTitle.includes('en proceso') || lowerTitle.includes('doing')) return 'yellow';
    if (lowerTitle.includes('hecho') || lowerTitle.includes('done')) return 'green';
    return 'blue';
  };

  const getPriorityFromContent = (content: string): "alta" | "media" | "baja" | undefined => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('alta') || lowerContent.includes('urgente')) return 'alta';
    if (lowerContent.includes('media')) return 'media';
    if (lowerContent.includes('baja')) return 'baja';
    return undefined;
  };

  const getAssigneeFromContent = (content: string): string | undefined => {
    const match = content.match(/@(\w+)/);
    return match ? match[1] : undefined;
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'alta':
        return 'text-red-400';
      case 'media':
        return 'text-yellow-400';
      case 'baja':
        return 'text-green-400';
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-[var(--dark-primary)] z-40">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {document.title} - Vista Kanban
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-[var(--dark-secondary)] border-[var(--border-dark)] text-[var(--text-primary)] hover:bg-[var(--dark-tertiary)]"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar Vista
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-[var(--dark-secondary)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center">
                  <div className={`w-3 h-3 ${getColorClasses(column.color)} rounded-full mr-2`} />
                  {column.title}
                </h3>
                <Badge variant="secondary" className="bg-[var(--dark-tertiary)] text-[var(--text-secondary)]">
                  {column.items.length}
                </Badge>
              </div>

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3">
                  {column.items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-[var(--dark-primary)] border rounded-lg p-3 cursor-move hover:border-[var(--accent-blue)] transition-colors ${
                        column.color === 'green' ? 'opacity-75 border-green-500/50' : 'border-[var(--border-dark)]'
                      }`}
                    >
                      <p className="text-sm text-[var(--text-primary)] mb-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {item.priority && (
                          <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority === 'alta' ? 'Alta prioridad' : 
                             item.priority === 'media' ? 'Media prioridad' : 
                             'Baja prioridad'}
                          </span>
                        )}
                        
                        {item.assignee && (
                          <div className="w-6 h-6 bg-[var(--accent-blue)] rounded-full text-xs text-white flex items-center justify-center">
                            {getInitials(item.assignee)}
                          </div>
                        )}
                        
                        {!item.assignee && !item.priority && (
                          <div className="w-6 h-6 bg-gray-500 rounded-full text-xs text-white flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {item.progress !== undefined && (
                        <div className="mt-2 w-full bg-[var(--dark-tertiary)] rounded-full h-1">
                          <div 
                            className="bg-[var(--accent-blue)] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      {column.color === 'green' && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="w-6 h-6 bg-green-500 rounded-full text-xs text-white flex items-center justify-center">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {column.items.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-secondary)]">
                      <p className="text-sm">No hay elementos en esta columna</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
