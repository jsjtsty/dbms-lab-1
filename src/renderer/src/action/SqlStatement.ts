import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface SqlStatementState {
  sql: string
}

const initialState: SqlStatementState = {
  sql: ''
}

const sqlStatementSlice = createSlice({
  name: 'sqlStatement',
  initialState: initialState,
  reducers: {
    updateSqlStatement: (state, action: PayloadAction<string>) => {
      state.sql = action.payload
    }
  }
})

export const selectSqlStatement = (root: RootState): string => root.sqlStatementReducer.sql

export default sqlStatementSlice.reducer
export const sqlStatementActions = sqlStatementSlice.actions
export type { SqlStatementState }
