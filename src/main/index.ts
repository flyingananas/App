import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDb, pingDb } from './db';
import * as api from './api';
import * as secureStorage from './secureStorage';
import * as aiAdapter from './aiAdapter';

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
  ipcMain.handle('db:setSetting', (_, key, value) => api.setSetting(key, value));
  ipcMain.handle('db:updateItem', (_, id, updates) => api.updateItem(id, updates));
  ipcMain.handle('db:deleteItem', (_, id) => api.deleteItem(id));
  ipcMain.handle('db:insertDoc', (_, doc) => api.insertDoc(doc));
  ipcMain.handle('db:updateDoc', (_, id, updates) => api.updateDoc(id, updates));
  ipcMain.handle('db:getDocs', () => api.getDocs());
  ipcMain.handle('db:deleteDoc', (_, id) => api.deleteDoc(id));
  ipcMain.handle('db:updateThreadState', (_, state) => api.updateThreadState(state));
  ipcMain.handle('db:activateItemByText', (_, text) => api.activateItemByText(text));

  ipcMain.handle('ai:setKey', (_, provider, key) => secureStorage.setAIKey(provider, key));
  ipcMain.handle('ai:hasKey', (_, provider) => secureStorage.hasAIKey(provider));
  ipcMain.handle('ai:generate', (_, prompt, options) => aiAdapter.generateContent(prompt, options));

  ipcMain.handle('db:exportData', () => api.exportData());
  ipcMain.handle('db:importData', (_, jsonData) => api.importData(jsonData));
  ipcMain.handle('db:exportMarkdown', () => api.exportMarkdown());

  ipcMain.handle('db:getProjects', () => api.getProjects());
  ipcMain.handle('db:getActiveProject', () => api.getActiveProject());
  ipcMain.handle('db:createProject', (_, name, statusLabels) => api.createProject(name, statusLabels));
  ipcMain.handle('db:updateProject', (_, id, updates) => api.updateProject(id, updates));
  ipcMain.handle('db:deleteProject', (_, id) => api.deleteProject(id));

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
