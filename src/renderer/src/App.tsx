import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  ChipDelete,
  FormControl,
  FormLabel,
  Link,
  Sheet,
  Stack,
  Table,
  Typography
} from '@mui/joy'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.min.css'
import parse from 'html-react-parser'
import { useAppDispatch, useAppSelector } from './action/hooks'
import { selectSqlStatement } from './action/SqlStatement'
import React from 'react'
import { InsertFilterDialog } from './InsertFilterDialog'
import { ConditionOption } from './util/SqlBridge'
import {
  selectColumnInformation,
  selectColumnInformationLoaded,
  selectData,
  tableActions
} from './action/Table'
import { ConnectSqlDialog } from './ConnectSqlDialog'

const transfromConditionOption = (
  column: string,
  relation: string,
  value: string,
  numeric: boolean
): ConditionOption => {
  const result: ConditionOption = {
    field: column ?? '',
    sql: column + ' ' + relation + ' ' + (numeric ? value : "'" + value + "'")
  }

  switch (relation) {
    case '=':
      result.exact = numeric ? parseFloat(value) : value
      break
    case 'like':
      result.fuzzy = value
      break
    case '<':
      result.range = {
        end: {
          value: parseFloat(value),
          included: false
        }
      }
      break
    case '>':
      result.range = {
        start: {
          value: parseFloat(value),
          included: false
        }
      }
      break
    case '<=':
      result.range = {
        end: {
          value: parseFloat(value),
          included: true
        }
      }
      break
    case '>=':
      result.range = {
        start: {
          value: parseFloat(value),
          included: true
        }
      }
      break
  }

  return result
}

function App(): JSX.Element {
  const dispatch = useAppDispatch()

  const [filters, setFilters] = React.useState<ConditionOption[]>([])

  const sqlStatement = useAppSelector(selectSqlStatement)
  const columnInformation = useAppSelector(selectColumnInformation)
  const columnInformationLoaded = useAppSelector(selectColumnInformationLoaded)
  const data = useAppSelector(selectData)

  const [openInsertFilter, setOpenInsertFilter] = React.useState<boolean>(false)
  const [openConnectDialog, setOpenConnectDialog] = React.useState<boolean>(true)
  const [database, setDatabase] = React.useState<string>('')
  const [table, setTable] = React.useState<string>('')

  React.useEffect(() => {
    if (openConnectDialog) {
      return
    }

    if (!columnInformationLoaded) {
      dispatch(tableActions.queryColumns(table))
    }
  }, [columnInformationLoaded, openConnectDialog])

  React.useEffect(() => {
    if (columnInformationLoaded) {
      dispatch(
        tableActions.refreshData({
          table: table,
          conditions: filters
        })
      )
    }
  }, [filters, columnInformationLoaded])

  return (
    <>
      <Box>
        <Breadcrumbs>
          <Link color="neutral">Databases</Link>
          <Link color="neutral">{database}</Link>
          <Link color="neutral">{table}</Link>
        </Breadcrumbs>
        <Stack
          sx={{
            paddingLeft: '10px',
            paddingRight: '10px'
          }}
          spacing={2}
        >
          <FormControl>
            <FormLabel>Filters</FormLabel>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.map((filter, index) => (
                <Chip
                  variant="soft"
                  key={index}
                  color="primary"
                  sx={{ height: 32 }}
                  endDecorator={
                    <ChipDelete
                      onDelete={() => {
                        setFilters(filters.filter((_, i) => i !== index))
                      }}
                    />
                  }
                >
                  {filter.sql}
                </Chip>
              ))}
              <Button
                size="sm"
                variant="soft"
                color="primary"
                sx={{
                  borderRadius: '16px',
                  fontSize: '15px'
                }}
                onClick={() => setOpenInsertFilter(true)}
              >
                +
              </Button>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>SQL Statement</FormLabel>
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: 'sm',
                height: 80,
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                padding: '5px 10px'
              }}
            >
              <Typography fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace">
                {parse(hljs.highlight(sqlStatement, { language: 'sql' }).value)}
              </Typography>
            </Sheet>
          </FormControl>
          <Sheet
            className="OrderTableContainer"
            variant="outlined"
            sx={{
              display: { xs: 'none', sm: 'initial' },
              width: '100%',
              borderRadius: 'sm',
              flexShrink: 1,
              overflow: 'auto',
              maxHeight: 350
            }}
          >
            <Table
              aria-labelledby="tableTitle"
              stickyHeader
              hoverRow
              sx={{
                '--Table-headerUnderlineThickness': '1px'
              }}
            >
              <thead style={{ background: 'red' }}>
                <tr>
                  <th style={{ height: 20, width: 36, textAlign: 'center', padding: '12px 6px' }}>
                    <Checkbox size="sm" sx={{ verticalAlign: 'text-bottom' }} />
                  </th>
                  {columnInformation.map((column) => (
                    <th key={column.name} style={{ height: 20, width: 100, padding: '12px 6px' }}>
                      <Link
                        underline="none"
                        color="primary"
                        component="button"
                        fontWeight="lg"
                        //endDecorator={<ArrowDropDownIcon />}
                        sx={{
                          '& svg': {
                            transition: '0.2s'
                          }
                        }}
                      >
                        <Typography
                          sx={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {column.name}
                        </Typography>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'center', width: 36 }}>
                      <Checkbox
                        size="sm"
                        slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                        sx={{ verticalAlign: 'text-bottom' }}
                      />
                    </td>
                    {columnInformation.map((column) => (
                      <td key={column.name} width={100}>
                        <Typography
                          sx={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {row[column.name]?.toString()}
                        </Typography>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Stack>
      </Box>
      <InsertFilterDialog
        open={openInsertFilter}
        onClose={() => setOpenInsertFilter(false)}
        onApply={(column: string, relation: string, value: string, numeric: boolean) => {
          const option = transfromConditionOption(column, relation, value, numeric)
          setFilters([...filters, option])
          setOpenInsertFilter(false)
        }}
        columns={columnInformation}
      />
      <ConnectSqlDialog
        open={openConnectDialog}
        onApply={(database, table) => {
          setDatabase(database)
          setTable(table)
          setOpenConnectDialog(false)
        }}
      />
    </>
  )
}

export default App
