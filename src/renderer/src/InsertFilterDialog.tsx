import {
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
  Radio,
  RadioGroup,
  Select,
  Stack,
  Option
} from '@mui/joy'
import FilterIcon from '@mui/icons-material/Filter'
import React from 'react'
import { SqlColumnInformation } from './util/SqlBridge'

interface InsertFilterDialogProps {
  open: boolean
  onClose: () => void
  onApply: (column: string, relation: string, value: string, numeric: boolean) => void
  columns: SqlColumnInformation[]
}

const numericTypes: string[] = [
  'int',
  'bigint',
  'decimal',
  'float',
  'double',
  'real',
  'numeric',
  'bit',
  'tinyint',
  'smallint',
  'mediumint',
  'year'
]

function InsertFilterDialog(props: InsertFilterDialogProps): JSX.Element {
  const { open, columns, onClose, onApply } = props

  const [column, setColumn] = React.useState<string | null>(null)
  const [relation, setRelation] = React.useState<string | null>('=')
  const [value, setValue] = React.useState<string>('')

  const columnInformation = columns.find((columnObject) => columnObject.name === column)
  const columnNumeric = columnInformation ? numericTypes.includes(columnInformation.type) : false

  const clear = (): void => {
    setColumn(null)
    setRelation(null)
    setValue('')
  }

  const onCloseDialog = (): void => {
    clear()
    onClose()
  }

  const onSubmitDialog = (): void => {
    clear()
    onApply(column ?? '', relation ?? '', value, columnNumeric)
  }

  const onColumnChange = (columnName: string | null): void => {
    const column = columns.find((column) => column.name === columnName)
    if (!column) {
      return
    }
    setColumn(columnName)

    if (numericTypes.includes(column.type)) {
      if (relation === 'like') {
        setRelation('=')
      }
    } else {
      if (relation !== '=' && relation !== 'like') {
        setRelation('=')
      }
    }
  }

  return (
    <Modal open={open} onClose={onCloseDialog}>
      <ModalDialog>
        <DialogTitle>
          <FilterIcon /> Apply Filter
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack width={380} spacing={2} padding="1px 1px 1px 1px">
            <FormControl>
              <FormLabel>Column</FormLabel>
              <Select
                onChange={(_, newValue: string | null) => {
                  onColumnChange(newValue)
                }}
              >
                {columns.map((column) => (
                  <Option key={column.name} value={column.name}>
                    {column.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Relation</FormLabel>
              <RadioGroup
                orientation="horizontal"
                defaultValue="="
                value={relation}
                onChange={(event) => {
                  setRelation(event.target.value)
                }}
              >
                <Radio value="=" label="=" />
                <Radio value="<" label="<" disabled={!columnNumeric} />
                <Radio value=">" label=">" disabled={!columnNumeric} />
                <Radio value="<=" label="<=" disabled={!columnNumeric} />
                <Radio value=">=" label=">=" disabled={!columnNumeric} />
                <Radio value="like" label="like" disabled={columnNumeric} />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Value</FormLabel>
              <Input value={value} onChange={(event) => setValue(event.target.value)} />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            color="primary"
            disabled={!(column !== null && relation !== null && value != null)}
            onClick={onSubmitDialog}
          >
            Submit
          </Button>
          <Button variant="plain" color="neutral" onClick={onCloseDialog}>
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export { InsertFilterDialog }
