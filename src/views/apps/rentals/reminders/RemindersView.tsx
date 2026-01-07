'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'

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

interface Reminder {
  id: number
  tenant: {
    id: number
    full_name: string
    phone: string
  }
  invoice: {
    id: number
    invoice_number: string
    total_amount: number
  } | null
  type: string
  status: string
  sent_at: string | null
  created_at: string
}

interface Tenant {
  id: number
  full_name: string
}

interface Invoice {
  id: number
  invoice_number: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Reminder>()

const RemindersView = ({ serverMode }: { serverMode: Mode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [tenantSearch, setTenantSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState({
    tenant_id: '',
    invoice_id: '',
    type: 'upcoming'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, trigger reminder generation to ensure we have reminders
        try {
          await api.post('/reminders/generate-all')
        } catch (error) {
          console.error('Error generating reminders:', error)
        }
        
        // Then fetch reminders
        const params: any = {}
        if (statusFilter !== 'all') params.status = statusFilter
        if (typeFilter !== 'all') params.type = typeFilter

        const response = await api.get('/reminders', { params })
        setReminders(response.data || [])
      } catch (error) {
        console.error('Error fetching reminders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [statusFilter, typeFilter])

  // Debounced tenant search
  useEffect(() => {
    if (openDialog) {
      const timer = setTimeout(() => {
        fetchTenants(tenantSearch)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [tenantSearch, openDialog])

  // Debounced invoice search
  useEffect(() => {
    if (openDialog && formData.tenant_id) {
      const timer = setTimeout(() => {
        fetchInvoices(invoiceSearch, formData.tenant_id)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [invoiceSearch, formData.tenant_id, openDialog])

  const fetchTenants = async (search: string = '') => {
    setTenantsLoading(true)
    try {
      const params: any = { status: 'active' }
      if (search) {
        params.search = search
      }
      const response = await api.get('/tenants', { params })
      setTenants(response.data || [])
    } catch (error) {
      console.error('Error fetching tenants:', error)
      setTenants([])
    } finally {
      setTenantsLoading(false)
    }
  }

  const fetchInvoices = async (search: string = '', tenantId: string = '') => {
    setInvoicesLoading(true)
    try {
      const params: any = { status: 'pending,overdue' }
      if (tenantId) {
        params.tenant_id = tenantId
      }
      if (search) {
        params.search = search
      }
      const response = await api.get('/invoices', { params })
      setInvoices(response.data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Initial load when dialog opens
  useEffect(() => {
    if (openDialog) {
      fetchTenants()
      if (formData.tenant_id) {
        fetchInvoices('', formData.tenant_id)
      }
    } else {
      // Reset when dialog closes
      setTenantSearch('')
      setInvoiceSearch('')
      setSelectedTenant(null)
      setSelectedInvoice(null)
    }
  }, [openDialog])

  const handleCreateReminder = async () => {
    try {
      const payload: any = {
        tenant_id: formData.tenant_id,
        type: formData.type
      }
      if (formData.invoice_id) {
        payload.invoice_id = formData.invoice_id
      }
      await api.post('/reminders', payload)
      toast.success('Reminder created successfully!')
      setOpenDialog(false)
      setFormData({ tenant_id: '', invoice_id: '', type: 'upcoming' })
      setSelectedTenant(null)
      setSelectedInvoice(null)
      // Refresh list
      const response = await api.get('/reminders')
      setReminders(response.data || [])
    } catch (error: any) {
      console.error('Error creating reminder:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create reminder'
      toast.error(errorMessage)
    }
  }

  const handleSendReminder = async (reminderId: number) => {
    try {
      const response = await api.post(`/reminders/${reminderId}/send-email`)
      if (response.data.success) {
        toast.success('Reminder sent successfully via email!')
      } else {
        toast.error(response.data.message || 'Failed to send reminder')
      }
      // Refresh list
      const remindersResponse = await api.get('/reminders')
      setReminders(remindersResponse.data || [])
    } catch (error: any) {
      console.error('Error sending reminder:', error)
      const errorMessage = error.response?.data?.message || 'Failed to send reminder'
      toast.error(errorMessage)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success'
      case 'failed':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      upcoming: 'Upcoming Payment',
      due_today: 'Due Today',
      overdue: 'Overdue',
      demand: 'Demand Note'
    }
    return labels[type] || type
  }

  const columns = useMemo<ColumnDef<Reminder, any>[]>(
    () => [
      columnHelper.accessor('tenant', {
        header: 'Tenant',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.tenant?.full_name || 'N/A'}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.tenant?.phone}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('invoice', {
        header: 'Invoice',
        cell: ({ row }) => (
          row.original.invoice ? (
            <Button
              size='small'
              component={Link}
              href={`/en/apps/rentals/invoices/details/${row.original.invoice.id}`}
            >
              {row.original.invoice.invoice_number}
            </Button>
          ) : (
            <Typography color='text.secondary'>N/A</Typography>
          )
        )
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => (
          <Chip
            label={getTypeLabel(row.original.type)}
            size='small'
            color={row.original.type === 'overdue' ? 'error' : 'primary'}
          />
        )
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
      columnHelper.accessor('sent_at', {
        header: 'Sent At',
        cell: ({ row }) => (
          <Typography>
            {row.original.sent_at
              ? new Date(row.original.sent_at).toLocaleString()
              : 'Not sent'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {row.original.status === 'pending' && (
              <Button
                size='small'
                variant='outlined'
                onClick={() => handleSendReminder(row.original.id)}
              >
                Send
              </Button>
            )}
          </div>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: reminders,
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
        <CardHeader title='Reminders' />
        <Typography className='p-4'>Loading...</Typography>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
          <Typography variant='h5'>Reminders</Typography>
          <Button
            variant='contained'
            onClick={() => setOpenDialog(true)}
            startIcon={<i className='ri-add-line' />}
          >
            Create Reminder
          </Button>
        </div>
        <div className='border-t'>
          <Tabs value={statusFilter} onChange={(_, value) => setStatusFilter(value)}>
            <Tab label='All' value='all' />
            <Tab label='Pending' value='pending' />
            <Tab label='Sent' value='sent' />
            <Tab label='Failed' value='failed' />
          </Tabs>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
          <TextField
            size='small'
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search reminders...'
            className='is-full sm:is-auto'
            InputProps={{
              startAdornment: <i className='ri-search-line text-xl' />
            }}
          />
          <FormControl size='small' className='min-is-[150px]'>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label='Type' onChange={e => setTypeFilter(e.target.value)}>
              <MenuItem value='all'>All Types</MenuItem>
              <MenuItem value='upcoming'>Upcoming</MenuItem>
              <MenuItem value='due_today'>Due Today</MenuItem>
              <MenuItem value='overdue'>Overdue</MenuItem>
              <MenuItem value='demand'>Demand Note</MenuItem>
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
                    No reminders found
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create New Reminder</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mts-4'>
            <Autocomplete
              fullWidth
              options={tenants}
              value={selectedTenant}
              onChange={(event, newValue) => {
                setSelectedTenant(newValue)
                setFormData(prev => ({
                  ...prev,
                  tenant_id: newValue ? newValue.id.toString() : '',
                  invoice_id: '' // Reset invoice when tenant changes
                }))
                setSelectedInvoice(null)
                if (newValue) {
                  fetchInvoices('', newValue.id.toString())
                }
              }}
              inputValue={tenantSearch}
              onInputChange={(event, newInputValue) => {
                setTenantSearch(newInputValue)
              }}
              getOptionLabel={(option) => `${option.full_name} - ${(option as any).phone || 'N/A'}`}
              loading={tenantsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select Tenant'
                  required
                  placeholder='Search by name or phone...'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {tenantsLoading ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div className='flex flex-col'>
                    <Typography variant='body2' className='font-medium'>
                      {option.full_name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {(option as any).phone || 'N/A'} • {(option as any).unit?.unit_number || 'N/A'}
                    </Typography>
                  </div>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={tenantsLoading ? 'Loading...' : 'No tenants found'}
            />
            <Autocomplete
              fullWidth
              options={invoices}
              value={selectedInvoice}
              onChange={(event, newValue) => {
                setSelectedInvoice(newValue)
                setFormData(prev => ({
                  ...prev,
                  invoice_id: newValue ? newValue.id.toString() : ''
                }))
              }}
              inputValue={invoiceSearch}
              onInputChange={(event, newInputValue) => {
                setInvoiceSearch(newInputValue)
              }}
              getOptionLabel={(option) => `${option.invoice_number} - ${(option as any).tenant?.full_name || 'N/A'}`}
              loading={invoicesLoading}
              disabled={!formData.tenant_id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select Invoice (Optional)'
                  placeholder={formData.tenant_id ? 'Search by invoice number...' : 'Select tenant first'}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {invoicesLoading ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div className='flex flex-col'>
                    <Typography variant='body2' className='font-medium'>
                      {option.invoice_number}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {(option as any).tenant?.full_name || 'N/A'} • UGX {((option as any).total_amount || 0).toLocaleString()}
                    </Typography>
                  </div>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={invoicesLoading ? 'Loading...' : formData.tenant_id ? 'No invoices found' : 'Select tenant first'}
            />
            <FormControl fullWidth required>
              <InputLabel>Reminder Type</InputLabel>
              <Select
                label='Reminder Type'
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value='upcoming'>Upcoming Payment</MenuItem>
                <MenuItem value='due_today'>Due Today</MenuItem>
                <MenuItem value='overdue'>Overdue</MenuItem>
                <MenuItem value='demand'>Demand Note</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleCreateReminder}>
            Create Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RemindersView
