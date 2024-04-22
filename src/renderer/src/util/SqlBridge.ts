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
  sql?: string
}

interface SqlQueryOptions {
  table: string
  columns?: string[]
  conditions?: ConditionOption[]
  order?: OrderOption[]
}

export type { SqlInitOptions, SqlColumnInformation, SqlQueryOptions, ConditionOption }
