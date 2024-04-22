import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'
import { SqlColumnInformation, SqlQueryOptions } from '../main/util/SqlBridge'

// Custom APIs for renderer
const api = {
  open: async (host: string, port: number, user: string, password: string): Promise<boolean> => {
    return ipcRenderer.invoke('open', host, port, user, password)
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
  query: async <T>(sql: SqlQueryOptions): Promise<T[]> => {
    return ipcRenderer.invoke('query', sql)
  },
  fetchDatabases: async (): Promise<string[]> => {
    return ipcRenderer.invoke('fetchDatabases')
  },
  fetchTables: async (): Promise<string[]> => {
    return ipcRenderer.invoke('fetchTables')
  }
}

const listener = {
  onSql: (callback: (sql: string) => void): void => {
    ipcRenderer.on('sql', (_, sql: string) => {
      callback(sql)
    })
  }
}

type CustomAPI = typeof api
type CustomListener = typeof listener

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
    listener: CustomListener
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('listener', listener)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

export type { CustomAPI, CustomListener }
