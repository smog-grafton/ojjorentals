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

interface Bill {
  id: number
  reference_number?: string
  bill_type: string
  vendor?: {
    name: string
  }
  property?: {
    name: string
  }
  unit?: {
    unit_number: string
  }
  amount: number
  due_date: string
  status: string
  payments?: Array<{ amount: number }>
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Bill>()

const BillsList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {}
        if (statusFilter !== 'all') {
          params.status = statusFilter
        }
        const response = await api.get('/bills', { params })
        setBills(response.data || [])
      } catch (error) {
        console.error('Error fetching bills:', error)
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

  const getBillTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      water: 'Water',
      electricity: 'Electricity',
      service: 'Service',
      internet: 'Internet',
      other: 'Other'
    }
    return labels[type] || type
  }

  const columns = useMemo<ColumnDef<Bill, any>[]>(
    () => [
      columnHelper.accessor('reference_number', {
        header: 'Reference #',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.reference_number || `BILL-${row.original.id}`}
          </Typography>
        )
      }),
      columnHelper.accessor('bill_type', {
        header: 'Type',
        cell: ({ row }) => (
          <Chip label={getBillTypeLabel(row.original.bill_type)} size='small' variant='tonal' />
        )
      }),
      columnHelper.accessor('vendor', {
        header: 'Vendor',
        cell: ({ row }) => <Typography>{row.original.vendor?.name || 'N/A'}</Typography>
      }),
      columnHelper.accessor('property', {
        header: 'Property',
        cell: ({ row }) => (
          <Typography>
            {row.original.property?.name || 'N/A'}
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
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.due_date)}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const totalPaid = row.original.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
          const outstanding = row.original.amount - totalPaid
          const status = outstanding <= 0 ? 'paid' : row.original.status
          
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              color={getStatusColor(status) as any}
              size='small'
            />
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/bills/details/${row.original.id}`)}
            >
              <i className='ri-eye-line' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/bills/edit/${row.original.id}`)}
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
    data: bills,
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
        <CardHeader title='Bills' />
        <Typography className='p-6'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Bills'
        action={
          <Button
            variant='contained'
            component={Link}
            href='/en/apps/rentals/bills/add'
            startIcon={<i className='ri-add-line' />}
          >
            Add Bill
          </Button>
        }
      />
      <div className='flex flex-col gap-4 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <TextField
            size='small'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search bills...'
            className='is-full sm:is-auto'
            slotProps={{
              input: {
                startAdornment: <i className='ri-search-line text-textSecondary' />
              }
            }}
          />
          <Tabs value={statusFilter} onChange={(_, value) => setStatusFilter(value)}>
            <Tab value='all' label='All' />
            <Tab value='pending' label='Pending' />
            <Tab value='overdue' label='Overdue' />
            <Tab value='paid' label='Paid' />
          </Tabs>
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
                    <Typography className='p-6'>No bills found</Typography>
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

export default BillsList
