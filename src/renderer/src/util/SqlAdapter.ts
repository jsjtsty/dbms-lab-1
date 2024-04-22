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

function generateSqlStatement(options: SqlQueryOptions): string {
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

  return sql
}

export { generateSqlStatement }
