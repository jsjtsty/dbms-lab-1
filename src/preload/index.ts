import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  test: async (): Promise<number> => {
    return ipcRenderer.invoke('test')
  }
}

type CustomAPI = typeof api

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

export type { CustomAPI }
