#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Gestor 360 en modo Electron...\n');

// Configurar variables de entorno
process.env.NODE_ENV = 'development';

// Ejecutar Electron
const electronProcess = spawn('electron', [path.join(__dirname, 'electron/main.js')], {
  stdio: 'inherit',
  env: process.env
});

electronProcess.on('close', (code) => {
  console.log(`\n📱 Electron cerrado con código: ${code}`);
  process.exit(code);
});

electronProcess.on('error', (err) => {
  console.error('❌ Error ejecutando Electron:', err);
  console.log('\n💡 Asegúrate de que Electron esté instalado:');
  console.log('   npm install electron');
  process.exit(1);
});