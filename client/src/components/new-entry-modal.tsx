import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { documentAPI } from "@/lib/electron-adapter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertDocumentSchema, type Document } from "@shared/schema";
import { z } from "zod";

const formSchema = insertDocumentSchema.extend({
  enableKanban: z.boolean().optional(),
  documentType: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFolder: string;
  onDocumentCreated: (document: Document) => void;
}

const DOCUMENT_TEMPLATES = {
  planificacion: {
    types: ["Sprint Planning", "Roadmap", "OKRs", "Retrospectiva"],
    defaultContent: (title: string, type: string) => `# ${title}

## Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3

## Por hacer
- Tarea pendiente 1
- Tarea pendiente 2

## En proceso
- Tarea en desarrollo

## Hecho
- Tarea completada
`,
  },
  dde: {
    types: ["Decisión Arquitectónica", "Decisión Técnica", "Decisión de Proceso"],
    defaultContent: (title: string, type: string) => `# ${title}

## Contexto
Describe el contexto que llevó a esta decisión.

## Decisión
La decisión tomada y las razones detrás de ella.

## Consecuencias
### Positivas
- Beneficio 1
- Beneficio 2

### Negativas
- Limitación 1
- Limitación 2

## Alternativas Consideradas
- Alternativa 1: Descripción y razón por la que se descartó
- Alternativa 2: Descripción y razón por la que se descartó
`,
  },
  retrospectivas: {
    types: ["Sprint Retrospective", "Quarterly Review", "Project Retrospective"],
    defaultContent: (title: string, type: string) => `# ${title}

## ¿Qué salió bien?
- Aspecto positivo 1
- Aspecto positivo 2

## ¿Qué podemos mejorar?
- Área de mejora 1
- Área de mejora 2

## Acciones para el próximo periodo
- [ ] Acción 1
- [ ] Acción 2
- [ ] Acción 3
`,
  },
  notas: {
    types: ["Nota General", "Idea", "Investigación", "Meeting Notes"],
    defaultContent: (title: string, type: string) => `# ${title}

## Contenido
Escribe aquí el contenido de tu nota...

## Tags
#${type.toLowerCase().replace(/\s+/g, '-')}

## Referencias
- [Enlace 1](URL)
- [Enlace 2](URL)
`,
  },
};

export default function NewEntryModal({
  isOpen,
  onClose,
  selectedFolder,
  onDocumentCreated,
}: NewEntryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      folder: selectedFolder,
      filename: "",
      enableKanban: false,
      documentType: "",
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: FormData) => {
      const template = DOCUMENT_TEMPLATES[selectedFolder as keyof typeof DOCUMENT_TEMPLATES];
      const content = template 
        ? template.defaultContent(data.title, data.documentType || template.types[0])
        : data.content || `# ${data.title}\n\n${data.content || 'Contenido del documento...'}`;

      return documentAPI.createDocument({
        title: data.title,
        content,
        folder: selectedFolder,
        filename: '', // Se generará automáticamente en el backend
      });
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onDocumentCreated(document);
      onClose();
      form.reset();
      toast({
        title: "Documento creado",
        description: "El nuevo documento se ha creado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createDocumentMutation.mutate(data);
  };

  const template = DOCUMENT_TEMPLATES[selectedFolder as keyof typeof DOCUMENT_TEMPLATES];
  const folderName = {
    planificacion: "Planificación",
    dde: "DDE",
    retrospectivas: "Retrospectivas", 
    notas: "Notas"
  }[selectedFolder] || selectedFolder;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--dark-secondary)] border-[var(--border-dark)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Nueva Entrada - {folderName}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Crear un nuevo documento de {folderName.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-primary)]">
                    Título del documento
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Sprint Planning Q2"
                      className="bg-[var(--dark-tertiary)] border-[var(--border-dark)] text-[var(--text-primary)] focus:border-[var(--accent-blue)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {template && (
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--text-primary)]">
                      Tipo de {folderName.toLowerCase()}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[var(--dark-tertiary)] border-[var(--border-dark)] text-[var(--text-primary)]">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[var(--dark-secondary)] border-[var(--border-dark)]">
                        {template.types.map((type) => (
                          <SelectItem key={type} value={type} className="text-[var(--text-primary)]">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-primary)]">
                    Descripción (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Breve descripción del documento..."
                      className="bg-[var(--dark-tertiary)] border-[var(--border-dark)] text-[var(--text-primary)] focus:border-[var(--accent-blue)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableKanban"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-[var(--border-dark)]"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-[var(--text-primary)]">
                    Habilitar vista Kanban
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white"
                disabled={createDocumentMutation.isPending}
              >
                {createDocumentMutation.isPending ? "Creando..." : "Crear Documento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
