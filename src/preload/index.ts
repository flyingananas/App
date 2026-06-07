import { contextBridge, ipcRenderer } from 'electron';

const api = {
  pingDb: (): Promise<boolean> => ipcRenderer.invoke('db:ping'),
  insertItem: (item: any): Promise<any> => ipcRenderer.invoke('db:insertItem', item),
  getItems: (): Promise<any[]> => ipcRenderer.invoke('db:getItems'),
  insertDevTrack: (track: any): Promise<any> => ipcRenderer.invoke('db:insertDevTrack', track),
  getDevTracks: (): Promise<any[]> => ipcRenderer.invoke('db:getDevTracks'),
  getLastDevTrack: (): Promise<any | null> => ipcRenderer.invoke('db:getLastDevTrack'),
  getSettings: (): Promise<Record<string, string>> => ipcRenderer.invoke('db:getSettings'),
  updateThreadState: (state: string): Promise<void> => ipcRenderer.invoke('db:updateThreadState', state),
  activateItemByText: (text: string): Promise<boolean> => ipcRenderer.invoke('db:activateItemByText', text),
};

contextBridge.exposeInMainWorld('api', api);

export type API = typeof api;
