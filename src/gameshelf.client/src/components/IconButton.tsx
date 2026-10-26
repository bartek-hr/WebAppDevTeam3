import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode
  // Korte tekst in de tooltip
  tooltip: string
  // Voor schermlezers en tests, bijv. "Bewerk Catan". Standaard de tooltip.
  label?: string
  // Kleur van de rand en het icoon (zie .btn--outline-* in styles/components.css)
  variant?: 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger'
}

// Kleine knop met alleen een icoon; de uitleg staat in de tooltip (data-tooltip, puur CSS)
export default function IconButton({
  icon,
  tooltip,
  label,
  variant = 'outline-secondary',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = ['btn', 'btn--sm', 'btn--icon', `btn--${variant}`, className]
  return (
    <button
      type={type}
      className={classes.filter(Boolean).join(' ')}
      aria-label={label ?? tooltip}
      data-tooltip={tooltip}
      {...props}
    >
      {icon}
    </button>
  )
}
