import { contextBridge, ipcRenderer } from 'electron';

const api = {
  pingDb: (): Promise<boolean> => ipcRenderer.invoke('db:ping'),
};

contextBridge.exposeInMainWorld('api', api);

export type API = typeof api;
