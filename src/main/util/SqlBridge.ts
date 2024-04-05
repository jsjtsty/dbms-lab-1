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

type SqlPotentialType = string | number | boolean

interface OrderOption {
  field: string
  type?: 'ASC' | 'DESC'
}

interface ConditionRangeEndpoint {
  value: number
  included?: boolean
}

interface ConditionRange {
  start?: ConditionRangeEndpoint
  end?: ConditionRangeEndpoint
}

interface ConditionOption {
  field: string
  exact?: SqlPotentialType
  fuzzy?: string
  range?: ConditionRange
}

interface SqlQueryOptions {
  table: string
  columns?: string[]
  conditions?: ConditionOption[]
  order?: OrderOption[]
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

  async query(options: SqlQueryOptions): Promise<object[]> {
    // 1. Transform query columns.
    let columns: string
    if (!options.columns || options.columns.length === 0) {
      columns = '*'
    } else {
      columns = options.columns.join(', ')
    }

    // 2. Transform conditions.
    let conditions: string | null = null
    if (options.conditions && options.conditions.length !== 0) {
      conditions = ' WHERE '

      const conditionStatements: string[] = []
      options.conditions.forEach((option: ConditionOption) => {
        if (option.exact) {
          switch (typeof option.exact) {
            case 'string':
              conditionStatements.push(`${option.field} = '${option.exact}'`)
              break
            default:
              conditionStatements.push(`${option.field} = ${option.exact}`)
              break
          }
        } else if (option.fuzzy) {
          conditionStatements.push(`${option.field} LIKE '${option.fuzzy}'`)
        } else if (option.range) {
          if (option.range.start) {
            conditionStatements.push(
              `${option.field} ${option.range.start.included ?? true ? '>=' : '>'} ${option.range.start.value}`
            )
          }
          if (option.range.end) {
            conditionStatements.push(
              `${option.field} ${option.range.end.included ?? true ? '<=' : '<'} ${option.range.end.value}`
            )
          }
        }
      })

      conditions += conditionStatements.join(' AND ')
    }

    // 3. Transform orders.
    let order: string | null = null
    if (options.order && options.order.length !== 0) {
      order = ' ORDER BY '

      const orderStatements: string[] = []
      options.order.forEach((option: OrderOption) => {
        orderStatements.push(`${option.field} ${option.type ?? 'ASC'}`)
      })

      order += orderStatements.join(', ')
    }

    // Generate SQL statement.
    let sql: string = `SELECT ${columns} FROM ${options.table}`
    if (conditions) {
      sql += conditions
    }
    if (order) {
      sql += order
    }
    sql += ';'

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
