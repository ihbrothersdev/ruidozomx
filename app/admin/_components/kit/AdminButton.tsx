import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * AdminButton — a pressed-tin control button. Hard ink edge, printed offset
 * shadow that "prints down" on press. The admin's take on the shadcn Button,
 * whose default tokens are the dark public theme.
 */
const adminButtonVariants = cva(
  "font-pt-mono admin-press inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border-2 border-admin-ink font-bold tracking-[0.1em] uppercase whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-admin-red focus-visible:ring-offset-2 focus-visible:ring-offset-admin-paper disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: 'bg-admin-red text-admin-surface',
        solid: 'bg-admin-ink text-admin-paper',
        outline: 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep',
        ghost: 'border-transparent shadow-none text-admin-ink hover:bg-admin-ink/8',
        danger: 'bg-admin-surface text-admin-red'
      },
      size: {
        default: 'h-9 px-4 text-xs',
        sm: 'h-8 px-3 text-[11px]',
        lg: 'h-11 px-6 text-sm',
        icon: 'h-9 w-9 p-0'
      }
    },
    defaultVariants: { variant: 'primary', size: 'default' }
  }
)

export function AdminButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof adminButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(adminButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { adminButtonVariants }
