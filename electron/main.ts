import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

function createWindows() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // 1. Dashboard UI Window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Depending on dev vs prod, we load URL or file
  mainWindow.loadURL('http://localhost:3000'); // Default to our vite server

  // 2. Transparent Overlay Window (for "sinking" balloons)
  overlayWindow = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    focusable: false,      // Click-through
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadURL('http://localhost:3000/overlay');
}

app.whenReady().then(() => {
  createWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Telemetry Hooks (Mocked global keystroke tracking)
// In a real Electron app, you'd use a native module like `iohook` or `uiohook-napi`
ipcMain.handle('get-keystroke-count', () => {
  // Mock function representing global keystrokes fetched from native API
  return Math.floor(Math.random() * 60); 
});
