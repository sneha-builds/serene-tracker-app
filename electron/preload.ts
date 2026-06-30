import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getKeystrokeCount: () => ipcRenderer.invoke('get-keystroke-count'),
  onTaskAltitudeWarning: (callback: (altitude: number) => void) => 
    ipcRenderer.on('task-altitude-warning', (_event, altitude) => callback(altitude)),
});
