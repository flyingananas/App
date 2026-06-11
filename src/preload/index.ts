import { contextBridge, ipcRenderer } from 'electron';

const api = {
  pingDb: (): Promise<boolean> => ipcRenderer.invoke('db:ping'),
  insertItem: (item: any): Promise<any> => ipcRenderer.invoke('db:insertItem', item),
  getItems: (): Promise<any[]> => ipcRenderer.invoke('db:getItems'),
  insertDevTrack: (track: any): Promise<any> => ipcRenderer.invoke('db:insertDevTrack', track),
  getDevTracks: (): Promise<any[]> => ipcRenderer.invoke('db:getDevTracks'),
  getLastDevTrack: (): Promise<any | null> => ipcRenderer.invoke('db:getLastDevTrack'),
  getSettings: (): Promise<Record<string, string>> => ipcRenderer.invoke('db:getSettings'),
  setSetting: (key: string, value: string): Promise<void> => ipcRenderer.invoke('db:setSetting', key, value),
  updateItem: (id: string, updates: any): Promise<void> => ipcRenderer.invoke('db:updateItem', id, updates),
  deleteItem: (id: string): Promise<void> => ipcRenderer.invoke('db:deleteItem', id),
  insertDoc: (doc: any): Promise<any> => ipcRenderer.invoke('db:insertDoc', doc),
  updateDoc: (id: string, updates: any): Promise<void> => ipcRenderer.invoke('db:updateDoc', id, updates),
  getDocs: (): Promise<any[]> => ipcRenderer.invoke('db:getDocs'),
  deleteDoc: (id: string): Promise<void> => ipcRenderer.invoke('db:deleteDoc', id),
  updateThreadState: (state: string): Promise<void> => ipcRenderer.invoke('db:updateThreadState', state),
  getActiveThreads: (): Promise<{ id: string, title: string }[]> => ipcRenderer.invoke('db:getActiveThreads'),
  activateItemByText: (text: string): Promise<boolean> => ipcRenderer.invoke('db:activateItemByText', text),
  setAIKey: (provider: string, key: string): Promise<void> => ipcRenderer.invoke('ai:setKey', provider, key),
  hasAIKey: (provider: string): Promise<boolean> => ipcRenderer.invoke('ai:hasKey', provider),
  generateAI: (promptOrMessages: any, options: any): Promise<string> => ipcRenderer.invoke('ai:generate', promptOrMessages, options),
  exportData: (): Promise<string> => ipcRenderer.invoke('db:exportData'),
  importData: (jsonData: string): Promise<void> => ipcRenderer.invoke('db:importData', jsonData),
  exportMarkdown: (): Promise<string> => ipcRenderer.invoke('db:exportMarkdown'),

  getProjects: (): Promise<any[]> => ipcRenderer.invoke('db:getProjects'),
  getActiveProject: (): Promise<any> => ipcRenderer.invoke('db:getActiveProject'),
  createProject: (name: string, statusLabels: string[]): Promise<any> => ipcRenderer.invoke('db:createProject', name, statusLabels),
  updateProject: (id: string, updates: any): Promise<void> => ipcRenderer.invoke('db:updateProject', id, updates),
  deleteProject: (id: string): Promise<void> => ipcRenderer.invoke('db:deleteProject', id),
};

contextBridge.exposeInMainWorld('api', api);

export type API = typeof api;
