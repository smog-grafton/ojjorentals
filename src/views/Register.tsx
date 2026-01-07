'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import api from '@/services/api'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  name: pipe(string(), minLength(1, 'This field is required')),
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
  phone: string(),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  ),
  password_confirmation: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  ),
})

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (data.password !== data.password_confirmation) {
      setErrorState({ message: ['Passwords do not match'] })
      return
    }

    setIsLoading(true)
    setErrorState(null)

    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      // Store token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirect to dashboard
      router.replace(getLocalizedUrl('/en/dashboards/rentals', locale as Locale))
    } catch (error: any) {
      setIsLoading(false)
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      
      setErrorState({
        message: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
      })
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
          </div>
          {errorState && (
            <Alert severity='error' onClose={() => setErrorState(null)}>
              {errorState.message[0]}
            </Alert>
          )}
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='Full Name'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='email'
                  label='Email'
                  error={!!errors.email || !!errorState}
                  helperText={errors.email?.message || (errorState && errorState.message[0])}
                />
              )}
            />
            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Phone (Optional)'
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
            <Controller
              name='password_confirmation'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Confirm Password'
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={handleClickShowConfirmPassword} onMouseDown={e => e.preventDefault()}>
                            <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/login', locale as Locale)} color='primary.main'>
                Sign in instead
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
