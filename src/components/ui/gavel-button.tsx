import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gavelButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:animate-gavel-strike',
  {
    variants: {
      variant: {
        primary: 'bg-gavel-blue text-parchment hover:bg-gavel-blue/90 shadow-lg hover:shadow-xl hover:shadow-gavel-blue/20',
        secondary: 'border-2 border-gavel-blue text-gavel-blue hover:bg-gavel-blue hover:text-parchment',
        accent: 'bg-verdict-gold text-gavel-blue hover:bg-verdict-gold/90 shadow-lg hover:shadow-xl hover:shadow-verdict-gold/20',
        destructive: 'bg-red-600 text-parchment hover:bg-red-700 shadow-lg',
        ghost: 'text-gavel-blue hover:bg-gavel-blue/10',
        link: 'text-verdict-gold underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        xl: 'h-16 px-10 py-5 text-lg',
        icon: 'h-12 w-12'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
)

export interface GavelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gavelButtonVariants> {
  asChild?: boolean
}

const GavelButton = React.forwardRef<HTMLButtonElement, GavelButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(gavelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GavelButton.displayName = 'GavelButton'

export { GavelButton, gavelButtonVariants }