'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

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

interface Invoice {
  id: number
  invoice_number: string
  tenant: {
    full_name: string
  }
  unit: {
    unit_number: string
    property: {
      name: string
    }
  }
  total_amount: number
  due_date: string
  status: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Invoice>()

const InvoicesList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = statusFilter !== 'all' ? { status: statusFilter } : {}
        const response = await api.get('/invoices', { params })
        setInvoices(response.data || [])
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [statusFilter])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'overdue':
        return 'error'
      default:
        return 'warning'
    }
  }

  const handleDownloadPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem('token')
      
      // Fetch PDF with authentication
      const response = await fetch(`${apiUrl}/api/v1/invoices/${invoiceId}/pdf?download=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const columns = useMemo<ColumnDef<Invoice, any>[]>(
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
        cell: ({ row }) => <Typography>{row.original.tenant?.full_name || 'N/A'}</Typography>
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
        cell: ({ row }) => <Typography>{formatCurrency(row.original.total_amount)}</Typography>
      }),
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.due_date)}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={getStatusColor(row.original.status) as any}
            size='small'
            className='capitalize'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/invoices/preview/${row.original.id}`)}
              title='Preview Invoice'
            >
              <i className='ri-eye-line' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/invoices/details/${row.original.id}`)}
              title='View Details'
            >
              <i className='ri-file-list-3-line' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDownloadPDF(row.original.id, row.original.invoice_number)} title='Download PDF'>
              <i className='ri-file-pdf-line' />
            </IconButton>
          </div>
        )
      })
    ],
    [router]
  )

  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    if (dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.due_date) >= new Date(dateFrom))
    }

    if (dateTo) {
      filtered = filtered.filter(inv => new Date(inv.due_date) <= new Date(dateTo))
    }

    return filtered
  }, [invoices, dateFrom, dateTo])

  const table = useReactTable({
    data: filteredInvoices,
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
        <CardHeader title='Invoices' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <Typography variant='h5'>Invoices</Typography>
        <Button
          variant='contained'
          component={Link}
          href='/en/apps/rentals/invoices/add'
          startIcon={<i className='ri-add-line' />}
        >
          Generate Invoice
        </Button>
      </div>
      <div className='border-t'>
        <Tabs value={statusFilter} onChange={(_, value) => setStatusFilter(value)}>
          <Tab label='All' value='all' />
          <Tab label='Pending' value='pending' />
          <Tab label='Paid' value='paid' />
          <Tab label='Overdue' value='overdue' />
        </Tabs>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search invoices...'
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
                  No invoices found
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

export default InvoicesList
