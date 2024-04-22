import { BrowserWindow, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { SqlColumnInformation, SqlInstance } from './util/SqlBridge'

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
    open: async (_, host: string, password: string): Promise<boolean> => {
      let result: boolean = false
      if (sqlInstance) {
        sqlInstance = new SqlInstance({
          host,
          password
        })
        sqlInstance.setSqlListener((sql: string) => {
          mainWindow.webContents.send('sql', sql)
        })
        await sqlInstance.connect()
        result = true
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
    query: async (_, sql: string): Promise<object[]> => {
      let result: object[] = []
      if (sqlInstance) {
        result = await sqlInstance.query(sql)
      }
      return result
    }
  }

  Object.entries(ipcInvokeHandlers).forEach(([channel, listener]) => {
    ipcMain.handle(channel, listener)
  })
}

export { handleIpcRequests, handleIpcInvokeRequests }
