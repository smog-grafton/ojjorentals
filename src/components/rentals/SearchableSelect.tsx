'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// Service Imports
import api from '@/services/api'

interface SearchableSelectProps {
  label: string
  value: string | number | null
  onChange: (value: string | number | null) => void
  endpoint: string
  getOptionLabel: (option: any) => string
  getOptionValue: (option: any) => string | number
  renderOption?: (props: any, option: any) => React.ReactNode
  filterParams?: Record<string, any>
  required?: boolean
  disabled?: boolean
  placeholder?: string
  error?: boolean
  helperText?: string
  fullWidth?: boolean
}

const SearchableSelect = ({
  label,
  value,
  onChange,
  endpoint,
  getOptionLabel,
  getOptionValue,
  renderOption,
  filterParams = {},
  required = false,
  disabled = false,
  placeholder,
  error,
  helperText,
  fullWidth = true
}: SearchableSelectProps) => {
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      fetchOptions(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, open, endpoint])

  // Initial load
  useEffect(() => {
    if (open && options.length === 0) {
      fetchOptions('')
    }
  }, [open])

  const fetchOptions = async (search: string) => {
    setLoading(true)
    try {
      const params: any = { ...filterParams }
      if (search) {
        params.search = search
      }
      const response = await api.get(endpoint, { params })
      const data = response.data || []
      // Remove duplicates based on ID to prevent React key warnings
      const uniqueOptions = data.filter((option: any, index: number, self: any[]) => 
        index === self.findIndex((o: any) => getOptionValue(o) === getOptionValue(option))
      )
      setOptions(uniqueOptions)
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const selectedOption = useMemo(() => {
    if (value === null || value === '') return null
    return options.find(opt => getOptionValue(opt) === value) || null
  }, [value, options, getOptionValue])

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedOption}
      onChange={(event, newValue) => {
        onChange(newValue ? getOptionValue(newValue) : null)
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      options={options}
      getOptionLabel={getOptionLabel}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={getOptionValue(option)}>
          {renderOption ? renderOption(props, option) : getOptionLabel(option)}
        </li>
      )}
      isOptionEqualToValue={(option, value) => getOptionValue(option) === getOptionValue(value)}
    />
  )
}

export default SearchableSelect
