'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Developed Designed with `}</span>
        <span>{`❤️`}</span>
        <span className='text-textSecondary'>{` by `}</span>
        <Link href='https://smogcoders.com' target='_blank' className='text-primary capitalize'>
          Smog Coders
        </Link>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='https://smogcoders.com/projects/easyrentals/licensing' target='_blank' className='text-primary'>
            License
          </Link>
          <Link href='https://smogcoders.com/projets' target='_blank' className='text-primary'>
            More Themes
          </Link>
          <Link
            href='https://smogcoders.com/projets/easyrentals/docs'
            target='_blank'
            className='text-primary'
          >
            Documentation
          </Link>
          <Link href='https://wa.me/256702093354' target='_blank' className='text-primary'>
            Support
          </Link>
        </div>
      )}
    </div>
  )
}

export default FooterContent
