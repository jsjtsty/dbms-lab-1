import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'
import { SqlColumnInformation } from '../main/util/SqlBridge'

// Custom APIs for renderer
const api = {
  open: async (host: string, password: string): Promise<boolean> => {
    return ipcRenderer.invoke('open', host, password)
  },
  close: async (): Promise<boolean> => {
    return ipcRenderer.invoke('close')
  },
  selectDatabase: async (database: string): Promise<boolean> => {
    return ipcRenderer.invoke('selectDatabase', database)
  },
  fetchColumns: async (table: string): Promise<SqlColumnInformation[]> => {
    return ipcRenderer.invoke('fetchColumns', table)
  },
  query: async <T>(sql: string): Promise<T[]> => {
    return ipcRenderer.invoke('query', sql)
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
