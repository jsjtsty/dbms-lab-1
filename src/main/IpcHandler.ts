import { BrowserWindow, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { SqlColumnInformation, SqlInstance, SqlQueryOptions } from './util/SqlBridge'

interface IpcHandlers {
  [channel: string]: (event: IpcMainEvent, ...args: any[]) => void
}

interface IpcInvokeHandlers {
  [channel: string]: (event: IpcMainInvokeEvent, ...args: any[]) => any
}

let sqlInstance: SqlInstance | null = null

function handleIpcRequests(ipcMain: IpcMain): void {
  const ipcHandlers: IpcHandlers = {}

  Object.entries(ipcHandlers).forEach(([channel, listener]) => {
    ipcMain.on(channel, listener)
  })
}

function handleIpcInvokeRequests(ipcMain: IpcMain, mainWindow: BrowserWindow): void {
  const ipcInvokeHandlers: IpcInvokeHandlers = {
    open: async (
      _,
      host: string,
      port: number,
      user: string,
      password: string
    ): Promise<boolean> => {
      let result: boolean = false
      if (!sqlInstance) {
        sqlInstance = new SqlInstance({
          host,
          port,
          user,
          password
        })
        sqlInstance.setSqlListener((sql: string) => {
          mainWindow.webContents.send('sql', sql)
        })
        try {
          await sqlInstance.connect()
          result = true
        } catch (e) {
          sqlInstance = null
        }
      }
      return result
    },
    close: async (): Promise<boolean> => {
      let result: boolean = false
      if (sqlInstance) {
        await sqlInstance.close()
        sqlInstance = null
        result = true
      }
      return result
    },
    selectDatabase: async (_, database: string): Promise<boolean> => {
      let result: boolean = false
      if (sqlInstance) {
        await sqlInstance.selectDatabase(database)
        result = true
      }
      return result
    },
    fetchColumns: async (_, table: string): Promise<SqlColumnInformation[]> => {
      let result: SqlColumnInformation[] = []
      if (sqlInstance) {
        result = await sqlInstance.queryTableStructure(table)
      }
      return result
    },
    query: async (_, sql: SqlQueryOptions): Promise<object[]> => {
      let result: object[] = []
      if (sqlInstance) {
        result = await sqlInstance.query(sql)
      }
      return result
    },
    fetchDatabases: async (): Promise<string[]> => {
      let result: string[] = []
      if (sqlInstance) {
        result = await sqlInstance.queryDatabases()
      }
      return result
    },
    fetchTables: async (): Promise<string[]> => {
      let result: string[] = []
      if (sqlInstance) {
        result = await sqlInstance.queryTables()
      }
      return result
    }
  }

  Object.entries(ipcInvokeHandlers).forEach(([channel, listener]) => {
    ipcMain.handle(channel, listener)
  })
}

export { handleIpcRequests, handleIpcInvokeRequests }
