import * as React from 'react'
import { cn } from '@/lib/utils'

const CourtroomCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-verdict-gold/20 bg-mahogany/90 backdrop-blur-sm text-parchment shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-verdict-gold/10',
      className
    )}
    {...props}
  />
))
CourtroomCard.displayName = 'CourtroomCard'

const CourtroomCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
))
CourtroomCardHeader.displayName = 'CourtroomCardHeader'

const CourtroomCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-bold leading-none tracking-tight text-verdict-gold font-serif',
      className
    )}
    {...props}
  />
))
CourtroomCardTitle.displayName = 'CourtroomCardTitle'

const CourtroomCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-parchment/80', className)}
    {...props}
  />
))
CourtroomCardDescription.displayName = 'CourtroomCardDescription'

const CourtroomCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0 bg-parchment/5 rounded-b-lg', className)}
    {...props}
  />
))
CourtroomCardContent.displayName = 'CourtroomCardContent'

const CourtroomCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CourtroomCardFooter.displayName = 'CourtroomCardFooter'

export {
  CourtroomCard,
  CourtroomCardHeader,
  CourtroomCardTitle,
  CourtroomCardDescription,
  CourtroomCardContent,
  CourtroomCardFooter
}