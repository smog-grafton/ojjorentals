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

interface Property {
  id: number
  name: string
  location: string
  units?: Array<{ id: number; unit_number: string; status: string }>
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Property>()

const PropertiesList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/properties')
        setProperties(response.data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = useMemo<ColumnDef<Property, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Property Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => <Typography>{row.original.location}</Typography>
      }),
      columnHelper.display({
        id: 'units_count',
        header: 'Total Units',
        cell: ({ row }) => (
          <Typography>{row.original.units?.length || 0} units</Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/properties/details/${row.original.id}`)}
              title='View Details'
            >
              <i className='ri-eye-line' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => router.push(`/en/apps/rentals/properties/edit/${row.original.id}`)}
              title='Edit Property'
            >
              <i className='ri-edit-line' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setPropertyToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
              title='Delete Property'
            >
              <i className='ri-delete-bin-line text-error' />
            </IconButton>
          </div>
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: properties,
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
        <CardHeader title='Properties' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
        <Typography variant='h5'>Properties</Typography>
        <Button
          variant='contained'
          component={Link}
          href='/en/apps/rentals/properties/add'
          startIcon={<i className='ri-add-line' />}
        >
          Add Property
        </Button>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search properties...'
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
                  No properties found
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
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete property <strong>{propertyToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!propertyToDelete) return
              setDeleting(true)
              try {
                await api.delete(`/properties/${propertyToDelete.id}`)
                toast.success('Property deleted successfully!')
                setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id))
                setDeleteDialogOpen(false)
                setPropertyToDelete(null)
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete property')
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

export default PropertiesList
