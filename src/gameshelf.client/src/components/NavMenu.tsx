import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface NavMenuProps {
  // Tekst (of tekst met icoon) op de knop
  label: ReactNode
  // Lijst rechts uitlijnen, bijv. voor het gebruikersmenu aan de rechterkant
  alignEnd?: boolean
  // Links en knoppen met className="nav-menu__item"
  children: ReactNode
}

// Uitklapmenu in de navigatiebalk: een knop die een lijst met links toont of verbergt
export default function NavMenu({ label, alignEnd = false, children }: NavMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  // Sluit bij een klik ergens anders op de pagina of met Escape
  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={menuRef}
      className={alignEnd ? 'nav-menu nav-menu--end' : 'nav-menu'}
      // Met Tab het menu uit: dicht
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        className="nav-menu__toggle"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {label}
      </button>
      {open && (
        <div
          id={listId}
          className="nav-menu__list"
          // Na het kiezen van een link of knop gaat het menu dicht
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a, button')) setOpen(false)
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
