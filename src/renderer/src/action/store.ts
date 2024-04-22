import { configureStore } from '@reduxjs/toolkit'
import SqlStatementReducer from './SqlStatement'
import TableReducer from './Table'

const store = configureStore({
  reducer: {
    sqlStatementReducer: SqlStatementReducer,
    tableReducer: TableReducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export { store }
