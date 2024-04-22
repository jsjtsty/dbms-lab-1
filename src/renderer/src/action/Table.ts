import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { SqlColumnInformation, SqlQueryOptions } from '@renderer/util/SqlBridge'
import { RootState } from './store'

interface TableState {
  columnInformation: SqlColumnInformation[]
  columnInformationLoaded: boolean
  data: object[]
  dataLoaded: boolean
}

const initialState: TableState = {
  columnInformation: [],
  columnInformationLoaded: false,
  data: [],
  dataLoaded: false
}

const queryColumns = createAsyncThunk('table/queryColumns', async (table: string) => {
  const data = await window.api.fetchColumns(table)
  return data
})

const refreshData = createAsyncThunk('table/refreshData', async (options: SqlQueryOptions) => {
  const data = await window.api.query<object>(options)
  return data
})

const tableSlice = createSlice({
  name: 'table',
  initialState: initialState,
  reducers: {
    clear: (state): void => {
      state.columnInformation = []
      state.columnInformationLoaded = false
      state.data = []
      state.dataLoaded = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryColumns.fulfilled, (state, action) => {
        state.columnInformation = action.payload
        state.columnInformationLoaded = true
      })
      .addCase(refreshData.fulfilled, (state, action) => {
        state.data = action.payload
        state.dataLoaded = true
      })
  }
})

export const selectColumnInformation = (state: RootState): SqlColumnInformation[] =>
  state.tableReducer.columnInformation
export const selectColumnInformationLoaded = (state: RootState): boolean =>
  state.tableReducer.columnInformationLoaded
export const selectData = (state: RootState): object[] => state.tableReducer.data
export const selectDataLoaded = (state: RootState): boolean => state.tableReducer.dataLoaded

export default tableSlice.reducer
export const tableActions = { ...tableSlice.actions, queryColumns, refreshData }
