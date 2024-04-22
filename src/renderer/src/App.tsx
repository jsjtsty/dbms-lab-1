import {
  Avatar,
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.min.css'
import parse from 'html-react-parser'
import React from 'react'

function App(): JSX.Element {
  const chips = ['Age ~ [20, 40]', 'Department ~ 213710%', 'Class = 2137101']

  const [sqlStatement, setSqlStatement] = React.useState<string>('')

  return (
    <Box>
      <Breadcrumbs>
        <Link color="neutral" href="/">
          Databases
        </Link>
        <Link color="neutral" href="/">
          dbms_lab_1
        </Link>
        <Link color="neutral" href="/">
          t_students
        </Link>
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
          <Stack direction="row" spacing={1}>
            {chips.map((chip, index) => (
              <Chip
                variant="soft"
                key={index}
                color="primary"
                endDecorator={
                  <ChipDelete onDelete={() => setSqlStatement('select * from ladders;')} />
                }
              >
                {chip}
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
            height: 350
          }}
        >
          <Table
            aria-labelledby="tableTitle"
            stickyHeader
            hoverRow
            sx={{
              //'--TableCell-headBackground': 'var(--joy-palette-background-level1)',
              '--Table-headerUnderlineThickness': '1px',
              //'--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
              '--TableCell-paddingY': '4px',
              '--TableCell-paddingX': '8px'
            }}
          >
            <thead style={{ background: 'red' }}>
              <tr>
                <th style={{ height: 20, width: 48, textAlign: 'center', padding: '12px 6px' }}>
                  <Checkbox size="sm" sx={{ verticalAlign: 'text-bottom' }} />
                </th>
                <th style={{ height: 20, width: 120, padding: '12px 6px' }}>
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      '& svg': {
                        transition: '0.2s'
                      }
                    }}
                  >
                    Invoice
                  </Link>
                </th>
                <th style={{ height: 20, width: 140, padding: '12px 6px' }}>Date</th>
                <th style={{ height: 20, width: 140, padding: '12px 6px' }}>Status</th>
                <th style={{ height: 20, width: 140, padding: '12px 6px' }}>Customer</th>
                <th style={{ height: 20, width: 140, padding: '12px 6px' }}> </th>
              </tr>
            </thead>
            <tbody>
              {(function (): JSX.Element[] {
                const val: JSX.Element[] = []
                for (let i = 0; i < 100; ++i) {
                  val.push(
                    <tr>
                      <td style={{ textAlign: 'center', width: 120 }}>
                        <Checkbox
                          size="sm"
                          slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                          sx={{ verticalAlign: 'text-bottom' }}
                        />
                      </td>
                      <td>
                        <Typography level="body-xs">秀杰</Typography>
                      </td>
                      <td>
                        <Typography level="body-xs">李林</Typography>
                      </td>
                      <td>
                        <Chip variant="soft" size="sm"></Chip>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Avatar size="sm">李</Avatar>
                          <div>
                            <Typography level="body-xs">李林</Typography>
                            <Typography level="body-xs">秀杰</Typography>
                          </div>
                        </Box>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Link level="body-xs" component="button">
                            Download
                          </Link>
                        </Box>
                      </td>
                    </tr>
                  )
                }
                return val
              })()}
            </tbody>
          </Table>
        </Sheet>
      </Stack>
    </Box>
  )
}

export default App
