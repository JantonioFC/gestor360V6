# Gestor 360 - Aplicación de Gestión de Documentos Local

Gestor 360 es una aplicación de escritorio moderna para gestionar documentos de desarrollo con capacidades de edición Markdown, vista Kanban y sincronización con Git/GitHub. Diseñada para privacidad total ejecutándose localmente en tu máquina.

## Características

### 🏠 **Aplicación Local**
- Ejecuta completamente en tu máquina (Linux y Windows 11)
- Sin dependencias de internet para funcionalidad básica
- Privacidad total - tus documentos nunca salen de tu control

### 📁 **Gestión de Documentos**
- **DDE (Documentos de Decisión)**: Para decisiones técnicas y arquitectónicas
- **Planificación**: Sprints, roadmaps, OKRs
- **Retrospectivas**: Análisis de sprints y proyectos
- **Notas**: Documentación general e ideas

### ✏️ **Editor Avanzado**
- Editor Markdown con vista previa en tiempo real
- Plantillas automáticas según el tipo de documento
- Auto-guardado cada 30 segundos
- Atajos de teclado (Ctrl+S para guardar)

### 📋 **Vista Kanban**
- Conversión automática de documentos con secciones "Por hacer", "En proceso", "Hecho"
- Visualización de tareas y progreso
- Ideal para planificación y seguimiento

### 🔄 **Sincronización Git**
- Integración completa con Git
- Commits automáticos al crear/editar documentos
- Sincronización con GitHub
- Control de versiones completo

## Instalación

### Prerrequisitos
- Node.js 18+ instalado
- Git configurado en tu sistema
- Cuenta en GitHub (opcional, para sincronización)

### Opción 1: Ejecutar desde código fuente

```bash
# Clonar el repositorio
git clone <tu-repositorio-gestor360>
cd gestor360

# Instalar dependencias
npm install

# Modo desarrollo (aplicación web)
npm run dev

# Modo Electron (aplicación de escritorio)
npm run electron:dev
```

### Opción 2: Descargar ejecutable compilado

1. Ve a la sección [Releases](../../releases) 
2. Descarga el archivo para tu sistema operativo:
   - **Linux**: `Gestor-360-X.X.X.AppImage` o `.deb`
   - **Windows**: `Gestor-360-Setup-X.X.X.exe` o `.exe` portable

### Configuración Inicial

1. **Primera ejecución**: La aplicación creará automáticamente:
   - Carpeta `~/Gestor360-Docs` en tu directorio personal
   - Estructura de carpetas (dde, planificacion, retrospectivas, notas)
   - Repositorio Git local
   - Documento de bienvenida

2. **Configurar GitHub** (opcional):
   - Crea un repositorio nuevo en GitHub
   - En la aplicación, click en el botón de sincronización
   - Configura el repositorio remoto:
   ```bash
   cd ~/Gestor360-Docs
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   git push -u origin main
   ```

## Uso

### Crear Documentos
1. Selecciona una carpeta en la barra lateral
2. Click en "Nueva Entrada"
3. Elige el tipo de documento y completa el formulario
4. La aplicación genera automáticamente una plantilla apropiada

### Editar Documentos
- **Editor**: Escribe en Markdown en el panel izquierdo
- **Vista Previa**: Ve el resultado formateado en el panel derecho
- **Vista Kanban**: Cambia la vista para documentos con estructura de tareas

### Sincronización
- **Automática**: Cada cambio se guarda automáticamente
- **Git**: Los documentos se commitean automáticamente al Git local
- **GitHub**: Usa el botón de sincronización para subir/bajar cambios

## Estructura de Archivos

```
~/Gestor360-Docs/
├── dde/                    # Documentos de Decisión
├── planificacion/          # Documentos de planificación
├── retrospectivas/         # Retrospectivas de proyectos
├── notas/                  # Notas generales
├── .git/                   # Control de versiones Git
└── .gitignore             # Archivos ignorados
```

## Desarrollo

### Comandos disponibles

```bash
# Desarrollo web
npm run dev                 # Servidor web en http://localhost:5173

# Desarrollo Electron
npm run electron           # Solo Electron (requiere servidor web corriendo)
npm run electron:dev       # Electron + servidor web automático

# Build para distribución
npm run build:electron     # Compilar frontend para Electron
npm run electron:pack      # Crear paquete local sin instalar
npm run electron:dist      # Crear instaladores para distribución
```

### Arquitectura Dual

La aplicación funciona tanto como:
- **Aplicación Web**: Para desarrollo y pruebas
- **Aplicación Electron**: Para uso de escritorio local

El adaptador automático (`electron-adapter.ts`) detecta el entorno y utiliza:
- APIs de Electron para acceso directo a archivos cuando está disponible
- APIs HTTP del servidor web como fallback

## Compatibilidad

### Sistemas Operativos Soportados
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+, otras distribuciones modernas
- **Windows**: Windows 10, Windows 11
- **macOS**: macOS 10.15+ (compilación disponible bajo demanda)

### Formatos de Distribución
- **Linux**: AppImage (portable), .deb (Debian/Ubuntu)
- **Windows**: NSIS installer, portable .exe
- **macOS**: .dmg

## Privacidad y Seguridad

- ✅ **100% Local**: Ningún dato se envía a servidores externos
- ✅ **Control Total**: Tus documentos permanecen en tu máquina
- ✅ **Git Opcional**: Puedes usar Git solo localmente sin GitHub
- ✅ **Código Abierto**: Código fuente completamente auditable

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

MIT License - ve [LICENSE](LICENSE) para detalles.

## Soporte

- **Issues**: [GitHub Issues](../../issues)
- **Documentación**: [Wiki](../../wiki)
- **Discusiones**: [GitHub Discussions](../../discussions)

---

**Gestor 360** - Tu asistente personal para documentación de desarrollo, diseñado con privacidad y control local en mente.