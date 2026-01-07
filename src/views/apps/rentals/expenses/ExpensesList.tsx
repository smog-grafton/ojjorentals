'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface Expense {
  id: number
  category: {
    name: string
  }
  property?: {
    name: string
  }
  unit?: {
    unit_number: string
  }
  amount: number
  description: string
  expense_date: string
  payment_method: string
  reference: string
  created_by: {
    name: string
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Expense>()

const ExpensesList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {}
        if (dateFrom) params.date_from = dateFrom
        if (dateTo) params.date_to = dateTo
        const response = await api.get('/expenses', { params })
        setExpenses(response.data || [])
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFrom, dateTo])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = useMemo<ColumnDef<Expense, any>[]>(
    () => [
      columnHelper.accessor('expense_date', {
        header: 'Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.expense_date)}</Typography>
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ row }) => <Typography>{row.original.category?.name || 'N/A'}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography className='max-w-[200px] truncate' title={row.original.description}>
            {row.original.description || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('property', {
        header: 'Property/Unit',
        cell: ({ row }) => (
          <Typography>
            {row.original.property?.name || 'General'}
            {row.original.unit && ` - ${row.original.unit.unit_number}`}
          </Typography>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {formatCurrency(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('payment_method', {
        header: 'Method',
        cell: ({ row }) => (
          <Typography className='capitalize'>{row.original.payment_method.replace('_', ' ')}</Typography>
        )
      }),
      columnHelper.accessor('created_by', {
        header: 'Created By',
        cell: ({ row }) => <Typography>{row.original.created_by?.name || 'N/A'}</Typography>
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/expenses/edit/${row.original.id}`)}
            >
              <i className='ri-pencil-line' />
            </IconButton>
          </div>
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: expenses,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 10
      },
      globalFilter
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  if (loading) {
    return (
      <Card>
        <CardHeader title='Expenses' />
        <Typography className='p-6'>Loading...</Typography>
      </Card>
    )
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card>
      <CardHeader
        title='Expenses'
        action={
          <Button
            variant='contained'
            component={Link}
            href='/en/apps/rentals/expenses/add'
            startIcon={<i className='ri-add-line' />}
          >
            Add Expense
          </Button>
        }
      />
      <div className='flex flex-col gap-4 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <TextField
            size='small'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search expenses...'
            className='is-full sm:is-auto'
            slotProps={{
              input: {
                startAdornment: <i className='ri-search-line text-textSecondary' />
              }
            }}
          />
          <div className='flex items-center gap-2'>
            <TextField
              size='small'
              type='date'
              label='From'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size='small'
              type='date'
              label='To'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </div>
        <div className='p-4 bg-actionHover rounded'>
          <Typography variant='h6' color='text.primary'>
            Total Expenses: {formatCurrency(totalExpenses)}
          </Typography>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    <Typography className='p-6'>No expenses found</Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component='div'
          count={table.getFilteredRowModel().rows.length}
          page={table.getState().pagination.pageIndex}
          rowsPerPage={table.getState().pagination.pageSize}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </div>
    </Card>
  )
}

export default ExpensesList
