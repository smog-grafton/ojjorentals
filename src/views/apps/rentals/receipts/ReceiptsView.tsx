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

interface Receipt {
  id: number
  receipt_number: string
  payment: {
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
  }
  issued_at: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Receipt>()

const ReceiptsView = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/receipts')
        setReceipts(response.data || [])
      } catch (error) {
        console.error('Error fetching receipts:', error)
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

  const handleDownloadPDF = (receiptId: number, receiptNumber: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    // Use download parameter to force download instead of stream
    const link = document.createElement('a')
    link.href = `${apiUrl}/api/v1/receipts/${receiptId}/pdf?download=1`
    link.download = `receipt-${receiptNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = useMemo<ColumnDef<Receipt, any>[]>(
    () => [
      columnHelper.accessor('receipt_number', {
        header: 'Receipt #',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.receipt_number}
          </Typography>
        )
      }),
      columnHelper.accessor('payment.invoice', {
        header: 'Invoice #',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='text'
            onClick={() =>
              router.push(`/en/apps/rentals/invoices/details/${row.original.payment.invoice.id}`)
            }
          >
            {row.original.payment.invoice.invoice_number}
          </Button>
        )
      }),
      columnHelper.accessor('payment.tenant', {
        header: 'Tenant',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='text'
            onClick={() =>
              router.push(`/en/apps/rentals/tenants/details/${row.original.payment.tenant.id}`)
            }
          >
            {row.original.payment.tenant.full_name}
          </Button>
        )
      }),
      columnHelper.accessor('payment.amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography className='font-medium' color='success.main'>
            {formatCurrency(row.original.payment.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('payment.payment_method', {
        header: 'Method',
        cell: ({ row }) => (
          <Typography>
            {row.original.payment.payment_method === 'iotec'
              ? 'IoTec'
              : row.original.payment.payment_method.replace('_', ' ')}
          </Typography>
        )
      }),
      columnHelper.accessor('payment.payment_date', {
        header: 'Payment Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.payment.payment_date)}</Typography>
      }),
      columnHelper.accessor('issued_at', {
        header: 'Issued At',
        cell: ({ row }) => <Typography>{formatDate(row.original.issued_at)}</Typography>
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/receipts/details/${row.original.id}`)}
            >
              <i className='ri-eye-line' />
            </IconButton>
            <Button size='small' variant='outlined' onClick={() => handleDownloadPDF(row.original.id, row.original.receipt_number)}>
              <i className='ri-file-pdf-line' />
            </Button>
          </div>
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: receipts,
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
        <CardHeader title='Receipts' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <Typography variant='h5'>Receipts</Typography>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search receipts...'
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
                  No receipts found
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

export default ReceiptsView
