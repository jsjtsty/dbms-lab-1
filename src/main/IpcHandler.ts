import { IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { SqlInstance } from './util/SqlBridge'

interface IpcHandlers {
  [channel: string]: (event: IpcMainEvent, ...args: unknown[]) => void
}

interface IpcInvokeHandlers {
  [channel: string]: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
}

const ipcHandlers: IpcHandlers = {
  mysql: async () => {
    const instance = new SqlInstance({
      password: 'sty@20030209'
    })
    instance.setSqlListener((sql) => console.log(sql))
    instance.connect()
    instance.selectDatabase('dbms')
    //console.log(await instance.queryTables())
    const result = await instance.query({
      table: 'test_dbms',
      columns: ['ID', 'Comment'],
      order: [{ field: 'ID', type: 'DESC' }],
      conditions: [
        {
          field: 'ID',
          range: { start: { value: 1 }, end: { value: 2 } }
        },
        {
          field: 'Comment',
          fuzzy: 'Test%'
        }
      ]
    })
    console.log(result)
  }
}

const ipcInvokeHandlers: IpcInvokeHandlers = {
  test: async () => {
    return 2
  }
}

function handleIpcRequests(ipcMain: IpcMain): void {
  Object.entries(ipcHandlers).forEach(([channel, listener]) => {
    ipcMain.on(channel, listener)
  })
}

function handleIpcInvokeRequests(ipcMain: IpcMain): void {
  Object.entries(ipcInvokeHandlers).forEach(([channel, listener]) => {
    ipcMain.handle(channel, listener)
  })
}

export { handleIpcRequests, handleIpcInvokeRequests }
