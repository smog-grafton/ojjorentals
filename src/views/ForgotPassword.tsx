'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import api from '@/services/api'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
})

const ForgotPasswordV2 = ({ mode }: { mode: Mode }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setIsLoading(true)
    setErrorState(null)
    setSuccessMessage(null)

    try {
      await api.post('/auth/forgot-password', {
        email: data.email,
      })

      setSuccessMessage('Password reset link has been sent to your email address.')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset link'
      setErrorState(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-4-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

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

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex items-center justify-center bs-full flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[677px] max-is-full bs-auto'
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
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
          </div>
          {errorState && (
            <Alert severity='error' onClose={() => setErrorState(null)}>
              {errorState}
            </Alert>
          )}
          {successMessage && (
            <Alert severity='success' onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  type='email'
                  label='Email'
                  error={!!errors.email || !!errorState}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isLoading || !!successMessage}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon
                  ltrIconClass='ri-arrow-left-s-line'
                  rtlIconClass='ri-arrow-right-s-line'
                  className='text-xl'
                />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordV2
