import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { renderRoutes } from '../test/utils'
import GamePicker from './GamePicker'

interface HarnessProps {
  onChange: (gameId: number | null) => void
  excludeIds?: number[]
}

// Houdt de gekozen waarde bij, zoals een formulier dat doet
function Harness({ onChange, excludeIds }: HarnessProps) {
  const [value, setValue] = useState<number | null>(null)
  return (
    <GamePicker
      value={value}
      excludeIds={excludeIds}
      onChange={(gameId) => {
        setValue(gameId)
        onChange(gameId)
      }}
    />
  )
}

function renderPicker(props: HarnessProps) {
  return renderRoutes([{ path: '/', element: <Harness {...props} /> }])
}

test('zoekt op titel en toont beide edities', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  renderPicker({ onChange })

  await user.type(await screen.findByRole('combobox'), 'catan')
  expect(screen.getAllByRole('option')).toHaveLength(2)

  await user.click(screen.getByRole('option', { name: /Catan Studio/ }))
  expect(onChange).toHaveBeenLastCalledWith(5)
  expect(screen.getByDisplayValue('Catan (Catan Studio, 2015)')).toBeInTheDocument()
})

test('kiest met de pijltjestoetsen en Enter', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  renderPicker({ onChange })

  // Gesorteerd op titel en daarna jaar: eerst de EN-doos (2015), dan de NL-doos (2016)
  await user.type(await screen.findByRole('combobox'), 'codenames')
  await user.keyboard('{ArrowDown}{Enter}')
  expect(onChange).toHaveBeenLastCalledWith(3)
})

test('toont geen uitgesloten games', async () => {
  const user = userEvent.setup()
  renderPicker({ onChange: vi.fn(), excludeIds: [1] })

  await user.type(await screen.findByRole('combobox'), 'catan')
  expect(screen.getAllByRole('option')).toHaveLength(1)
})

test('"Wijzigen" maakt de keuze leeg', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  renderPicker({ onChange })

  await user.type(await screen.findByRole('combobox'), 'azul')
  await user.click(screen.getByRole('option', { name: /Azul/ }))
  await user.click(screen.getByRole('button', { name: 'Wijzigen' }))

  expect(onChange).toHaveBeenLastCalledWith(null)
  expect(screen.getByRole('combobox')).toHaveFocus()
})
