import type { ReactNode } from 'react'
import { Button, OverlayTrigger, Tooltip, type ButtonProps } from 'react-bootstrap'

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode
  // Korte tekst in de tooltip
  tooltip: string
  // Voor schermlezers en tests, bijv. "Bewerk Catan". Standaard de tooltip.
  label?: string
}

// Kleine knop met alleen een icoon; de uitleg staat in de tooltip
export default function IconButton({ icon, tooltip, label, ...props }: IconButtonProps) {
  return (
    <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
      <Button size="sm" aria-label={label ?? tooltip} {...props}>
        {icon}
      </Button>
    </OverlayTrigger>
  )
}
