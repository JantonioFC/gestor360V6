const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const simpleGit = require('simple-git');
const chokidar = require('chokidar');
const os = require('os');

// Configuración de la aplicación
const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// Ruta donde se almacenarán los documentos (repositorio local)
const getDocumentsPath = () => {
  const homeDir = os.homedir();
  return path.join(homeDir, 'Gestor360-Docs');
};

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Cargar la aplicación
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Inicializar la aplicación
app.whenReady().then(() => {
  createWindow();
  
  // Inicializar el directorio de documentos
  initializeDocumentsDirectory();
  
  // Configurar vigilancia de archivos
  setupFileWatcher();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// **GESTIÓN DE ARCHIVOS Y CARPETAS**

// Inicializar directorio de documentos
async function initializeDocumentsDirectory() {
  const docsPath = getDocumentsPath();
  
  try {
    await fs.access(docsPath);
  } catch (error) {
    // El directorio no existe, lo creamos
    await fs.mkdir(docsPath, { recursive: true });
    
    // Crear estructura de carpetas
    const folders = ['dde', 'planificacion', 'retrospectivas', 'notas'];
    for (const folder of folders) {
      await fs.mkdir(path.join(docsPath, folder), { recursive: true });
    }
    
    // Inicializar git si no existe
    const git = simpleGit(docsPath);
    try {
      await git.status();
    } catch (gitError) {
      await git.init();
      await createGitIgnore(docsPath);
      await git.add('.gitignore');
      await git.commit('Initial commit - Gestor 360 setup');
    }
    
    // Crear documento de ejemplo
    await createSampleDocument(docsPath);
  }
}

// Crear .gitignore
async function createGitIgnore(docsPath) {
  const gitignoreContent = `# Gestor 360 - Archivos temporales
.DS_Store
Thumbs.db
*.tmp
*.temp
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
  
  await fs.writeFile(path.join(docsPath, '.gitignore'), gitignoreContent, 'utf8');
}

// Crear documento de ejemplo
async function createSampleDocument(docsPath) {
  const sampleContent = `# Bienvenido a Gestor 360

## Descripción
Este es tu primer documento en Gestor 360. La aplicación está configurada para trabajar localmente y sincronizar con Git.

## Características
- ✅ Aplicación de escritorio local
- ✅ Documentos almacenados como archivos Markdown
- ✅ Sincronización automática con Git
- ✅ Compatible con Linux y Windows 11
- ✅ Privacidad total (sin datos en la nube)

## Por hacer
- [ ] Configurar repositorio remoto en GitHub
- [ ] Crear tu primer documento de planificación
- [ ] Explorar la vista Kanban

## En proceso
- Configurando el entorno local

## Hecho
- ✅ Instalación de Gestor 360
- ✅ Inicialización del repositorio local

---
*Documento creado automáticamente - ${new Date().toLocaleDateString('es-ES')}*
`;

  const filename = `Bienvenida_${new Date().toISOString().slice(0, 10)}.md`;
  await fs.writeFile(path.join(docsPath, 'planificacion', filename), sampleContent, 'utf8');
}

// **IPC HANDLERS - Comunicación con el frontend**

// Obtener todas las carpetas
ipcMain.handle('get-folders', async () => {
  return [
    { id: 1, name: "DDE (Documentos de Decisión)", path: "dde", icon: "fas fa-lightbulb" },
    { id: 2, name: "Planificación", path: "planificacion", icon: "fas fa-calendar-alt" },
    { id: 3, name: "Retrospectivas", path: "retrospectivas", icon: "fas fa-history" },
    { id: 4, name: "Notas", path: "notas", icon: "fas fa-sticky-note" },
  ];
});

// Obtener todos los documentos
ipcMain.handle('get-documents', async () => {
  const docsPath = getDocumentsPath();
  const documents = [];
  const folders = ['dde', 'planificacion', 'retrospectivas', 'notas'];
  
  for (const folder of folders) {
    const folderPath = path.join(docsPath, folder);
    try {
      const files = await fs.readdir(folderPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      for (const file of mdFiles) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extraer título del contenido o usar nombre del archivo
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
        
        documents.push({
          id: Date.now() + Math.random(), // ID temporal
          title,
          content,
          folder,
          filename: file,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime
        });
      }
    } catch (error) {
      console.error(`Error reading folder ${folder}:`, error);
    }
  }
  
  return documents;
});

// Crear nuevo documento
ipcMain.handle('create-document', async (event, documentData) => {
  const docsPath = getDocumentsPath();
  const { title, content, folder } = documentData;
  
  // Generar nombre de archivo único
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_${timestamp}.md`;
  const filePath = path.join(docsPath, folder, filename);
  
  try {
    // Escribir archivo
    await fs.writeFile(filePath, content, 'utf8');
    
    // Obtener estadísticas del archivo
    const stats = await fs.stat(filePath);
    
    // Auto-commit con Git
    const git = simpleGit(docsPath);
    await git.add(path.join(folder, filename));
    await git.commit(`Nuevo documento: ${title}`);
    
    return {
      id: Date.now(),
      title,
      content,
      folder,
      filename,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
  } catch (error) {
    throw new Error(`Error creando documento: ${error.message}`);
  }
});

// Actualizar documento
ipcMain.handle('update-document', async (event, { filename, folder, content }) => {
  const docsPath = getDocumentsPath();
  const filePath = path.join(docsPath, folder, filename);
  
  try {
    await fs.writeFile(filePath, content, 'utf8');
    const stats = await fs.stat(filePath);
    
    // Auto-commit con Git
    const git = simpleGit(docsPath);
    await git.add(path.join(folder, filename));
    await git.commit(`Actualizado: ${filename}`);
    
    // Extraer título del contenido
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : filename.replace('.md', '');
    
    return {
      id: Date.now(),
      title,
      content,
      folder,
      filename,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
  } catch (error) {
    throw new Error(`Error actualizando documento: ${error.message}`);
  }
});

// Sincronizar con Git remoto
ipcMain.handle('git-sync', async () => {
  const docsPath = getDocumentsPath();
  const git = simpleGit(docsPath);
  
  try {
    // Verificar si hay un remoto configurado
    const remotes = await git.getRemotes(true);
    
    if (remotes.length === 0) {
      return {
        message: "No hay repositorio remoto configurado. Configura GitHub primero.",
        timestamp: new Date().toISOString(),
        status: "warning"
      };
    }
    
    // Hacer pull primero
    await git.pull();
    
    // Luego push
    await git.push();
    
    return {
      message: "Sincronización exitosa con GitHub",
      timestamp: new Date().toISOString(),
      status: "success"
    };
  } catch (error) {
    return {
      message: `Error de sincronización: ${error.message}`,
      timestamp: new Date().toISOString(),
      status: "error"
    };
  }
});

// Configurar repositorio remoto de GitHub
ipcMain.handle('setup-github-repo', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Configurar GitHub',
    message: 'Para configurar GitHub, necesitas:',
    detail: '1. Crear un repositorio en GitHub\n2. Copiar la URL del repositorio\n3. Configurar Git con tus credenciales',
    buttons: ['Abrir GitHub', 'Configurar Manualmente', 'Cancelar']
  });
  
  if (result.response === 0) {
    shell.openExternal('https://github.com/new');
  }
  
  return result.response;
});

// Configurar vigilancia de archivos
function setupFileWatcher() {
  const docsPath = getDocumentsPath();
  
  const watcher = chokidar.watch(docsPath, {
    ignored: /(^|[\/\\])\../, // Ignorar archivos ocultos
    persistent: true
  });
  
  watcher.on('change', (filePath) => {
    // Notificar al frontend sobre cambios de archivos
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file-changed', filePath);
    }
  });
}

// Abrir directorio de documentos en el explorador
ipcMain.handle('open-documents-folder', async () => {
  const docsPath = getDocumentsPath();
  shell.openPath(docsPath);
});

// Buscar documentos
ipcMain.handle('search-documents', async (event, query) => {
  const documents = await ipcMain.invoke('get-documents');
  const searchQuery = query.toLowerCase();
  
  return documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery) || 
    doc.content.toLowerCase().includes(searchQuery)
  );
});