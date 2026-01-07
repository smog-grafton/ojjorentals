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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

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
import { toast } from 'react-toastify'

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

interface Unit {
  id: number
  unit_number: string
  monthly_rent: number
  status: string
  property: {
    name: string
    location: string
  }
  tenant: {
    full_name: string
  } | null
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Unit>()

const UnitsList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/units')
        setUnits(response.data || [])
      } catch (error) {
        console.error('Error fetching units:', error)
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

  const columns = useMemo<ColumnDef<Unit, any>[]>(
    () => [
      columnHelper.accessor('unit_number', {
        header: 'Unit Number',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.unit_number}
          </Typography>
        )
      }),
      columnHelper.accessor('property', {
        header: 'Property',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.property?.name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.property?.location}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('monthly_rent', {
        header: 'Monthly Rent',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {formatCurrency(row.original.monthly_rent)}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={row.original.status === 'occupied' ? 'success' : 'default'}
            size='small'
            variant='tonal'
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('tenant', {
        header: 'Tenant',
        cell: ({ row }) => (
          <Typography>
            {row.original.tenant?.full_name || (
              <span className='text-textSecondary'>Vacant</span>
            )}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/units/details/${row.original.id}`)}
            >
              <i className='ri-eye-line text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/units/edit/${row.original.id}`)}
              title='Edit Unit'
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setUnitToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
              title='Delete Unit'
            >
              <i className='ri-delete-bin-line text-[22px] text-error' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: units,
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
        <CardHeader title='Units' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <Typography variant='h5'>Units</Typography>
        <Button
          variant='contained'
          component={Link}
          href='/en/apps/rentals/units/add'
          startIcon={<i className='ri-add-line' />}
        >
          Add Unit
        </Button>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search units...'
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
                  No units found
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Unit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete unit <strong>{unitToDelete?.unit_number}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!unitToDelete) return
              setDeleting(true)
              try {
                await api.delete(`/units/${unitToDelete.id}`)
                toast.success('Unit deleted successfully!')
                setUnits(prev => prev.filter(u => u.id !== unitToDelete.id))
                setDeleteDialogOpen(false)
                setUnitToDelete(null)
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete unit')
              } finally {
                setDeleting(false)
              }
            }}
            variant='contained'
            color='error'
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default UnitsList
