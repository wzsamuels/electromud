// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { CONNECT, READ, WRITE } from './constants'

contextBridge.exposeInMainWorld('electronAPI', {
  writeClient: (text: string) => ipcRenderer.send(WRITE, text),
  onReadClient: (callback) => ipcRenderer.on(READ, (_event, text: string) => callback(text)),
  connectClient: () => ipcRenderer.send(CONNECT),
  removeReadClient: (callback) => ipcRenderer.removeListener(READ, (_event, text: string) => callback(text)),
})