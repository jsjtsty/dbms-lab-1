import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './action/store'

import './main.css'
import { sqlStatementActions } from './action/SqlStatement'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App database="nul_dbms_1" table="t_students" />
    </Provider>
  </React.StrictMode>
)

window.listener.onSql((sql: string) => {
  store.dispatch(sqlStatementActions.updateSqlStatement(sql))
})
