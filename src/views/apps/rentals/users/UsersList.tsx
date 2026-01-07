'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
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
import type { ThemeColor } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import AddUserDrawer from './AddUserDrawer'

// Third-party Imports
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

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'staff'
  status: 'active' | 'inactive'
  created_at: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<User>()

const UsersList = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openDrawer, setOpenDrawer] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {}
        if (roleFilter !== 'all') params.role = roleFilter
        if (statusFilter !== 'all') params.status = statusFilter

        const response = await api.get('/users', { params })
        setUsers(response.data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roleFilter, statusFilter])

  const filteredData = useMemo(() => {
    if (!globalFilter) return users
    
    return users.filter(user => {
      const search = globalFilter.toLowerCase()
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.phone && user.phone.toLowerCase().includes(search))
      )
    })
  }, [users, globalFilter])

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar src={`/images/avatars/${(row.original.id % 8) + 1}.png`}>
              {row.original.name.charAt(0).toUpperCase()}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.name}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography>{row.original.phone || 'N/A'}</Typography>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <Chip
            label={row.original.role}
            size='small'
            color={row.original.role === 'admin' ? 'primary' : 'secondary'}
            variant='tonal'
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size='small'
            color={row.original.status === 'active' ? 'success' : 'default'}
            variant='tonal'
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {new Date(row.original.created_at).toLocaleDateString()}
          </Typography>
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
              onClick={() => router.push(`/en/apps/rentals/users/view/${row.original.id}`)}
            >
              View
            </Button>
            <OptionMenu
              options={[
                {
                  text: 'Edit',
                  menuItemProps: {
                    onClick: () => router.push(`/en/apps/rentals/users/edit/${row.original.id}`)
                  }
                },
                {
                  text: 'Delete',
                  menuItemProps: {
                    onClick: async () => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        try {
                          await api.delete(`/users/${row.original.id}`)
                          toast.success('User deleted successfully!')
                          setUsers(prev => prev.filter(u => u.id !== row.original.id))
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || 'Failed to delete user')
                        }
                      }
                    }
                  }
                }
              ]}
              iconButtonProps={{ size: 'small' }}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
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

  const handleAddUser = async (userData: any) => {
    try {
      const response = await api.post('/users', userData)
      toast.success('User added successfully!')
      setUsers(prev => [response.data, ...prev])
      setOpenDrawer(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add user'
      toast.error(errorMessage)
      throw error
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Users' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
          <Typography variant='h5'>Users</Typography>
          <Button
            variant='contained'
            onClick={() => setOpenDrawer(true)}
            startIcon={<i className='ri-add-line' />}
          >
            Add User
          </Button>
        </div>
        <Divider />
        <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
          <TextField
            size='small'
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search users...'
            className='is-full sm:is-auto'
            InputProps={{
              startAdornment: <i className='ri-search-line text-xl' />
            }}
          />
          <div className='flex items-center gap-4'>
            <FormControl size='small' className='min-is-[150px]'>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label='Role' onChange={e => setRoleFilter(e.target.value)}>
                <MenuItem value='all'>All Roles</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='staff'>Staff</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' className='min-is-[150px]'>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label='Status' onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value='all'>All Status</MenuItem>
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
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
                    No users found
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

      <AddUserDrawer
        open={openDrawer}
        handleClose={() => setOpenDrawer(false)}
        onAdd={handleAddUser}
      />
    </>
  )
}

export default UsersList
