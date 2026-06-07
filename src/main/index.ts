import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDb, pingDb } from './db';
import * as api from './api';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');
  const dbSuccess = initDb(userDataPath);
  console.log(`Database initialization ${dbSuccess ? 'succeeded' : 'failed'} at ${userDataPath}`);

  ipcMain.handle('db:ping', () => {
    return pingDb();
  });

  ipcMain.handle('db:insertItem', (_, item) => api.insertItem(item));
  ipcMain.handle('db:getItems', () => api.getItems());
  ipcMain.handle('db:insertDevTrack', (_, track) => api.insertDevTrack(track));
  ipcMain.handle('db:getDevTracks', () => api.getDevTracks());
  ipcMain.handle('db:getLastDevTrack', () => api.getLastDevTrack());
  ipcMain.handle('db:getSettings', () => api.getSettings());
  ipcMain.handle('db:updateThreadState', (_, state) => api.updateThreadState(state));
  ipcMain.handle('db:activateItemByText', (_, text) => api.activateItemByText(text));

  createWindow();

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
