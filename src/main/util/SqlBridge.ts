import { Connection, createConnection, RowDataPacket } from 'mysql2'

interface SqlInitOptions {
  host?: string
  user?: string
  password: string
  port?: number
}

interface SqlColumnInformation {
  name: string
  type: string
  nullable: boolean
  primary: boolean
  default: string | null
  extra: string
}

class SqlInstance {
  protected readonly connection: Connection
  protected sqlListener?: (sql: string) => void

  constructor(options: SqlInitOptions) {
    this.connection = createConnection({
      host: options.host ?? 'localhost',
      user: options.user ?? 'root',
      password: options.password,
      port: options.port ?? 3306
    })
  }

  protected injectSqlListener(sql: string): void {
    if (this.sqlListener) {
      this.sqlListener(sql)
    }
  }

  setSqlListener(listener: (sql: string) => void): void {
    this.sqlListener = listener
  }

  async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  async selectDatabase(database: string): Promise<void> {
    const sql: string = `USE ${database};`
    return new Promise<void>((resolve, reject) => {
      this.injectSqlListener(sql)
      this.connection.query(sql, (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  async queryDatabases(): Promise<string[]> {
    const sql: string = 'SHOW DATABASES;'
    return new Promise<string[]>((resolve, reject) => {
      this.injectSqlListener(sql)
      this.connection.query(sql, (err, results: RowDataPacket[]) => {
        if (err) {
          reject(err)
        }
        resolve(results.map((value) => value.Database))
      })
    })
  }

  async queryTables(): Promise<string[]> {
    const sql: string = 'SHOW TABLES;'
    return new Promise<string[]>((resolve, reject) => {
      this.injectSqlListener(sql)
      this.connection.query(sql, (err, results: RowDataPacket[]) => {
        if (err) {
          reject(err)
        }
        resolve(results.map((value) => Object.entries(value)[0][1]))
      })
    })
  }

  async queryTableStructure(table: string): Promise<SqlColumnInformation[]> {
    const sql: string = `SHOW COLUMNS FROM ${table};`
    return new Promise<SqlColumnInformation[]>((resolve, reject) => {
      this.injectSqlListener(sql)
      this.connection.query(sql, (err, results: RowDataPacket[]) => {
        if (err) {
          reject(err)
        }
        resolve(
          results.map((packet: RowDataPacket): SqlColumnInformation => {
            return {
              name: packet.Field,
              type: packet.Type,
              nullable: packet.Null === 'Yes',
              primary: packet.Key === 'PRI',
              default: packet.Default,
              extra: packet.Extra
            }
          })
        )
      })
    })
  }

  async query(sql: string): Promise<object[]> {
    return new Promise<object[]>((resolve, reject) => {
      this.injectSqlListener(sql)
      this.connection.query(sql, (err, results: RowDataPacket[]) => {
        if (err) {
          reject(err)
        }
        resolve(results)
      })
    })
  }
}

export { SqlInstance }
export type { SqlColumnInformation }
