'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'

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

interface OverdueInvoice {
  id: number
  invoice_number: string
  tenant: {
    full_name: string
    phone: string
  }
  unit: {
    unit_number: string
    property: {
      name: string
    }
  }
  total_amount: number
  due_date: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<OverdueInvoice>()

const OverdueView = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [overdue, setOverdue] = useState<OverdueInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/invoices?status=overdue')
        setOverdue(response.data || [])
      } catch (error) {
        console.error('Error fetching overdue items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const handleSendDemandNote = async (invoiceId: number) => {
    try {
      await api.post(`/demand-notes/${invoiceId}`)
      alert('Demand note created successfully')
    } catch (error) {
      console.error('Error creating demand note:', error)
      alert('Failed to create demand note')
    }
  }

  const columns = useMemo<ColumnDef<OverdueInvoice, any>[]>(
    () => [
      columnHelper.accessor('invoice_number', {
        header: 'Invoice #',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.invoice_number}
          </Typography>
        )
      }),
      columnHelper.accessor('tenant', {
        header: 'Tenant',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.tenant?.full_name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.tenant?.phone}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('unit', {
        header: 'Unit',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.unit?.unit_number}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.unit?.property?.name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('total_amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography className='font-medium' color='error.main'>
            {formatCurrency(row.original.total_amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => (
          <Typography color='error.main'>{formatDate(row.original.due_date)}</Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button
              size='small'
              variant='outlined'
              color='error'
              onClick={() => handleSendDemandNote(row.original.id)}
            >
              Send Demand Note
            </Button>
            <Button
              size='small'
              variant='outlined'
              onClick={() => router.push(`/en/apps/rentals/payments/record?invoice_id=${row.original.id}`)}
            >
              Record Payment
            </Button>
          </div>
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: overdue,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
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
        <CardHeader title='Overdue Invoices' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  const totalOverdue = overdue.reduce((sum, inv) => sum + inv.total_amount, 0)

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <div>
          <Typography variant='h5'>Overdue Invoices</Typography>
          <Typography variant='body2' color='text.secondary' className='mts-1'>
            Total Overdue: {formatCurrency(totalOverdue)}
          </Typography>
        </div>
      </div>
      {overdue.length === 0 && !loading && (
        <div className='p-6'>
          <Alert severity='success'>No overdue invoices at this time.</Alert>
        </div>
      )}
      {overdue.length > 0 && (
        <>
          <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
            <TextField
              size='small'
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder='Search overdue invoices...'
              className='is-full sm:is-auto'
              InputProps={{
                startAdornment: <i className='ri-search-line text-xl' />
              }}
            />
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
                              'flex items-center gap-2': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No overdue invoices found
                    </td>
                  </tr>
                ) : (
                  table
                    .getRowModel()
                    .rows.map(row => (
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
          <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
            <TablePagination
              component='div'
              count={table.getFilteredRowModel().rows.length}
              page={table.getState().pagination.pageIndex}
              rowsPerPage={table.getState().pagination.pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(_, page) => table.setPageIndex(page)}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </div>
        </>
      )}
    </Card>
  )
}

export default OverdueView
