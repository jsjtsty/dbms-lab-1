import {
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Stack
} from '@mui/joy'
import StorageIcon from '@mui/icons-material/Storage'
import React from 'react'

interface ConnectSqlDialogProps {
  open: boolean
  onApply: (database: string, table: string) => void
}

function ConnectSqlDialog(props: ConnectSqlDialogProps): JSX.Element {
  const { open, onApply } = props

  const [host, setHost] = React.useState<string>('localhost')
  const [user, setUser] = React.useState<string>('root')
  const [password, setPassword] = React.useState<string>('')
  const [port, setPort] = React.useState<string>('3306')
  const [databases, setDatabases] = React.useState<string[]>([])
  const [database, setDatabase] = React.useState<string | null>(null)
  const [tables, setTables] = React.useState<string[]>([])
  const [table, setTable] = React.useState<string | null>(null)

  const [status, setStatus] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (database === null || !status) {
      return
    }

    const switchDatabase = async (): Promise<boolean> => {
      let result: boolean = false
      if (database !== null) {
        await window.api.selectDatabase(database)
        setTables(await window.api.fetchTables())
        setTable(null)
        result = true
      }
      return result
    }

    switchDatabase().then((result) => {
      if (!result) {
        alert('Error switching database.')
      }
    })
  }, [database, status])

  const onConnect = (): void => {
    const portValue = parseInt(port)
    const connect = async (): Promise<boolean> => {
      const connectResult: boolean = await window.api.open(host, portValue, user, password)
      if (connectResult) {
        setStatus(true)
      } else {
        return false
      }

      setDatabases(await window.api.fetchDatabases())
      return true
    }
    connect().then((result) => {
      if (!result) {
        alert('Error connecting database.')
      }
    })
  }

  const onQuery = (): void => {
    onApply(database ?? '', table ?? '')
  }

  return (
    <Modal open={open} disableEscapeKeyDown>
      <ModalDialog>
        <DialogTitle>
          <StorageIcon /> Connect to MySQL
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack width={380} spacing={1} padding="1px 1px 1px 1px">
            <FormControl disabled={status}>
              <FormLabel>Host</FormLabel>
              <Input value={host} onChange={(e) => setHost(e.target.value)} />
            </FormControl>
            <FormControl disabled={status}>
              <FormLabel>Port</FormLabel>
              <Input value={port} onChange={(e) => setPort(e.target.value)} />
            </FormControl>
            <FormControl disabled={status}>
              <FormLabel>User</FormLabel>
              <Input value={user} onChange={(e) => setUser(e.target.value)} />
            </FormControl>
            <FormControl disabled={status}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl disabled={!status}>
              <FormLabel>Database</FormLabel>
              <Autocomplete
                options={databases}
                value={database}
                onChange={(_, value) => setDatabase(value)}
              />
            </FormControl>
            <FormControl disabled={!status}>
              <FormLabel>Table</FormLabel>
              <Autocomplete
                options={tables}
                value={table}
                onChange={(_, value) => setTable(value)}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            color="primary"
            disabled={!status || database === null || table === null}
            onClick={onQuery}
          >
            Query
          </Button>
          <Button variant="outlined" color="primary" disabled={status} onClick={onConnect}>
            {status ? 'Connected' : 'Connect'}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export { ConnectSqlDialog }
