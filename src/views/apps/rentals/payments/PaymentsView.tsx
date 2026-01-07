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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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

interface Payment {
  id: number
  invoice: {
    id: number
    invoice_number: string
  }
  tenant: {
    id: number
    full_name: string
  }
  amount: number
  payment_method: string
  payment_date: string
  receipt: {
    id: number
    receipt_number: string
  } | null
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Payment>()

const PaymentsView = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/payments')
        setPayments(response.data || [])
      } catch (error) {
        console.error('Error fetching payments:', error)
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

  const handleDownloadReceipt = (receiptId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    // Use download parameter to force download instead of stream
    const link = document.createElement('a')
    link.href = `${apiUrl}/api/v1/receipts/${receiptId}/pdf?download=1`
    link.download = `receipt-${receiptId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredPayments = useMemo(() => {
    let filtered = payments

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_method === methodFilter)
    }

    if (dateFrom) {
      filtered = filtered.filter(p => new Date(p.payment_date) >= new Date(dateFrom))
    }

    if (dateTo) {
      filtered = filtered.filter(p => new Date(p.payment_date) <= new Date(dateTo))
    }

    return filtered
  }, [payments, methodFilter, dateFrom, dateTo])

  const columns = useMemo<ColumnDef<Payment, any>[]>(
    () => [
      columnHelper.accessor('invoice', {
        header: 'Invoice #',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='text'
            onClick={() => router.push(`/en/apps/rentals/invoices/details/${row.original.invoice.id}`)}
          >
            {row.original.invoice.invoice_number}
          </Button>
        )
      }),
      columnHelper.accessor('tenant', {
        header: 'Tenant',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='text'
            onClick={() => router.push(`/en/apps/rentals/tenants/details/${row.original.tenant.id}`)}
          >
            {row.original.tenant.full_name}
          </Button>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography className='font-medium' color='success.main'>
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
      columnHelper.accessor('payment_date', {
        header: 'Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.payment_date)}</Typography>
      }),
      columnHelper.display({
        id: 'receipt',
        header: 'Receipt',
        cell: ({ row }) => (
          row.original.receipt ? (
            <div className='flex items-center gap-2'>
              <Typography variant='caption'>{row.original.receipt.receipt_number}</Typography>
              <IconButton
                size='small'
                onClick={() => row.original.receipt && router.push(`/en/apps/rentals/receipts/details/${row.original.receipt.id}`)}
              >
                <i className='ri-eye-line' />
              </IconButton>
              <IconButton size='small' onClick={() => row.original.receipt && handleDownloadReceipt(row.original.receipt.id)}>
                <i className='ri-file-pdf-line' />
              </IconButton>
            </div>
          ) : (
            <Typography variant='caption' color='text.secondary'>No receipt</Typography>
          )
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredPayments,
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
        <CardHeader title='Payments' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <div>
          <Typography variant='h5'>Payments & Receipts</Typography>
          <Typography variant='body2' color='text.secondary' className='mts-1'>
            Total: {formatCurrency(totalAmount)}
          </Typography>
        </div>
        <Button
          variant='contained'
          component={Link}
          href='/en/apps/rentals/payments/record'
          startIcon={<i className='ri-add-line' />}
        >
          Record Payment
        </Button>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search payments...'
          className='is-full sm:is-auto'
          InputProps={{
            startAdornment: <i className='ri-search-line text-xl' />
          }}
        />
        <TextField
          size='small'
          type='date'
          label='From Date'
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          className='min-is-[150px]'
        />
        <TextField
          size='small'
          type='date'
          label='To Date'
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          className='min-is-[150px]'
        />
        <FormControl size='small' className='min-is-[150px]'>
          <InputLabel>Payment Method</InputLabel>
          <Select value={methodFilter} label='Payment Method' onChange={e => setMethodFilter(e.target.value)}>
            <MenuItem value='all'>All Methods</MenuItem>
            <MenuItem value='cash'>Cash</MenuItem>
            <MenuItem value='mobile_money'>Mobile Money</MenuItem>
            <MenuItem value='bank'>Bank Transfer</MenuItem>
          </Select>
        </FormControl>
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
                  No payments found
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
    </Card>
  )
}

export default PaymentsView
