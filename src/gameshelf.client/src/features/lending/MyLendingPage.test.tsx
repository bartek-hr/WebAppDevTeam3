import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { addDays } from 'date-fns'
import { loginAs, renderRoutes } from '../../test/utils'
import LendingListPage from './LendingListPage'
import { formatDate, suggestedReturnDate, toDateString } from './lendingRules'
import { boxes, loanRequests, resetLendingMocks } from './mocks'
import MyLendingPage from './MyLendingPage'

const routes = [
  { path: '/lending', element: <LendingListPage /> },
  { path: '/lending/mine', element: <MyLendingPage /> },
]

beforeEach(() => {
  resetLendingMocks()
  loginAs('m2')
})

async function findBoxCard(title: string) {
  const heading = await screen.findByRole('heading', { name: title })
  return heading.closest<HTMLElement>('.card')!
}

async function findRequestItem(card: HTMLElement, userName: string) {
  return (await within(card).findByText(userName)).closest<HTMLElement>('li')!
}

async function findMyRequest(title: string) {
  const tab = await screen.findByRole('tabpanel', { name: 'Mijn aanvragen' })
  const link = await within(tab).findByRole('link', { name: title })
  return link.closest<HTMLElement>('li')!
}

const daysFromToday = (days: number) => toDateString(addDays(new Date(), days))

async function findLoan(section: 'Uitgeleend' | 'Geleend', title: string) {
  const region = await screen.findByRole('region', { name: section })
  return (await within(region).findByRole('link', { name: title })).closest<HTMLElement>('li')!
}

test('opent standaard de tab Mijn dozen met alleen mijn eigen dozen', async () => {
  renderRoutes(routes, '/lending/mine')

  expect(await screen.findByRole('tab', { name: 'Mijn dozen' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(await findBoxCard('7 Wonders Duel')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Catan' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Gloomhaven' })).not.toBeInTheDocument()
})

test('goedkeuren wijst de andere aanvragen op dezelfde doos af', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  const catan = await findBoxCard('Catan')
  expect(await within(catan).findAllByText('in afwachting')).toHaveLength(3)
  // Op volgorde van binnenkomst: noor eerst
  const [first, second, third] = within(catan).getAllByRole('listitem')
  expect(first).toHaveTextContent('noor')
  expect(second).toHaveTextContent('thijs')
  expect(third).toHaveTextContent('milan')

  await user.click(
    within(await findRequestItem(catan, 'noor')).getByRole('button', { name: 'Goedkeuren' }),
  )

  expect(
    await within(await findRequestItem(catan, 'noor')).findByText('goedgekeurd'),
  ).toBeInTheDocument()
  expect(within(await findRequestItem(catan, 'thijs')).getByText('afgewezen')).toBeInTheDocument()
  expect(within(await findRequestItem(catan, 'milan')).getByText('afgewezen')).toBeInTheDocument()
  expect(within(catan).queryByRole('button', { name: 'Goedkeuren' })).not.toBeInTheDocument()
  expect(within(catan).queryByRole('button', { name: 'Afwijzen' })).not.toBeInTheDocument()
})

test('afwijzen wijst alleen die ene aanvraag af', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  const catan = await findBoxCard('Catan')
  await user.click(
    await within(await findRequestItem(catan, 'thijs')).findByRole('button', { name: 'Afwijzen' }),
  )

  expect(
    await within(await findRequestItem(catan, 'thijs')).findByText('afgewezen'),
  ).toBeInTheDocument()
  expect(
    within(await findRequestItem(catan, 'noor')).getByText('in afwachting'),
  ).toBeInTheDocument()
  expect(
    within(await findRequestItem(catan, 'milan')).getByText('in afwachting'),
  ).toBeInTheDocument()
  expect(within(catan).getAllByRole('button', { name: 'Goedkeuren' })).toHaveLength(2)
})

test('beoordeelde aanvragen hebben geen knoppen meer', async () => {
  loginAs('m4')
  renderRoutes(routes, '/lending/mine')

  const twilight = await findBoxCard('Twilight Imperium (4e editie)')
  expect(
    within(await findRequestItem(twilight, 'sanne')).getByText('goedgekeurd'),
  ).toBeInTheDocument()
  expect(within(await findRequestItem(twilight, 'daan')).getByText('afgewezen')).toBeInTheDocument()
  expect(within(twilight).queryByRole('button', { name: 'Goedkeuren' })).not.toBeInTheDocument()
})

test('de eigenaar start de lening voor een goedgekeurde aanvraag', async () => {
  loginAs('m4')
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  const twilight = await findBoxCard('Twilight Imperium (4e editie)')
  expect(within(twilight).getByText('beschikbaar')).toBeInTheDocument()
  await user.click(
    await within(await findRequestItem(twilight, 'sanne')).findByRole('button', {
      name: 'Lening starten',
    }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'Lening starten' })
  expect(within(dialog).getByLabelText('Inleverdatum')).toHaveValue(suggestedReturnDate())
  await user.click(within(dialog).getByRole('button', { name: 'Lening starten' }))

  expect(await within(twilight).findByText('uitgeleend')).toBeInTheDocument()
  expect(within(twilight).queryByRole('button', { name: 'Lening starten' })).not.toBeInTheDocument()
})

test('een gestarte lening toont geen knop Lening starten meer', async () => {
  loginAs('m3')
  renderRoutes(routes, '/lending/mine')

  const gloomhaven = await findBoxCard('Gloomhaven')
  expect(within(gloomhaven).getByText('goedgekeurd')).toBeInTheDocument()
  expect(
    within(gloomhaven).queryByRole('button', { name: 'Lening starten' }),
  ).not.toBeInTheDocument()
})

test('goedkeuren kan niet zolang een goedgekeurde aanvraag nog geen lening is', async () => {
  loanRequests.push({
    id: 11,
    boxId: 8,
    requesterId: 'm6',
    status: 'Pending',
    createdOn: '2026-01-01',
  })
  loginAs('m4')
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  const twilight = await findBoxCard('Twilight Imperium (4e editie)')
  const milan = await findRequestItem(twilight, 'milan')
  await user.click(within(milan).getByRole('button', { name: 'Goedkeuren' }))

  expect(
    await within(milan).findByText('Er is al een aanvraag goedgekeurd die nog geen lening is.'),
  ).toBeInTheDocument()
  expect(within(milan).getByText('in afwachting')).toBeInTheDocument()
})

test('Mijn aanvragen toont de status van elke aanvraag', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  await user.click(await screen.findByRole('tab', { name: 'Mijn aanvragen' }))

  const gloomhaven = await findMyRequest('Gloomhaven')
  expect(within(gloomhaven).getByText('goedgekeurd')).toBeInTheDocument()
  expect(await within(gloomhaven).findByText('Eigenaar: noor')).toBeInTheDocument()
  const twilight = await findMyRequest('Twilight Imperium (4e editie)')
  expect(within(twilight).getByText('afgewezen')).toBeInTheDocument()
  expect(
    within(screen.getByRole('tabpanel', { name: 'Mijn aanvragen' })).getAllByRole('listitem'),
  ).toHaveLength(2)
})

test('een nieuwe aanvraag staat in afwachting onder Mijn aanvragen', async () => {
  const user = userEvent.setup()
  const { router } = renderRoutes(routes, '/lending')

  const codenames = (await screen.findByRole('link', { name: 'Codenames' })).closest<HTMLElement>(
    '.card',
  )!
  await user.click(await within(codenames).findByRole('button', { name: 'Aanvragen' }))
  await within(codenames).findByRole('button', { name: 'Aangevraagd' })
  await act(() => router.navigate('/lending/mine?tab=requests'))

  const request = await findMyRequest('Codenames')
  expect(within(request).getByText('in afwachting')).toBeInTheDocument()
  expect(await within(request).findByText('Eigenaar: lotte')).toBeInTheDocument()
})

test('toont een melding als er nog geen aanvragen zijn', async () => {
  loanRequests.splice(0, loanRequests.length)
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine')

  expect(await screen.findAllByText('Nog geen aanvragen')).toHaveLength(2)
  await user.click(screen.getByRole('tab', { name: 'Mijn aanvragen' }))
  const tab = await screen.findByRole('tabpanel', { name: 'Mijn aanvragen' })
  expect(await within(tab).findByText(/Je hebt nog geen dozen aangevraagd/)).toBeInTheDocument()
  expect(within(tab).getByRole('link', { name: 'Naar de uitleenlijst' })).toHaveAttribute(
    'href',
    '/lending',
  )
})

test('toont een melding als je nog geen dozen aanbiedt', async () => {
  boxes.splice(0, boxes.length)
  renderRoutes(routes, '/lending/mine')

  expect(await screen.findByText(/Je biedt nog geen dozen aan/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Naar de uitleenlijst' })).toHaveAttribute(
    'href',
    '/lending',
  )
})

test('Leningen toont wat ik uitleen en wat ik leen', async () => {
  loginAs('m3')
  renderRoutes(routes, '/lending/mine?tab=loans')

  const gloomhaven = await findLoan('Uitgeleend', 'Gloomhaven')
  expect(await within(gloomhaven).findByText('Geleend door: daan')).toBeInTheDocument()
  expect(within(gloomhaven).getByText('uitgeleend')).toBeInTheDocument()
  expect(within(gloomhaven).getByText('Nog 4 dagen')).toBeInTheDocument()

  const wingspan = await findLoan('Geleend', 'Wingspan')
  expect(await within(wingspan).findByText('Eigenaar: sanne')).toBeInTheDocument()
  expect(within(wingspan).getByText('verlengd')).toBeInTheDocument()
})

test('de doos bij de neef staat te laat', async () => {
  loginAs('m6')
  renderRoutes(routes, '/lending/mine?tab=loans')

  const cousinLoan = await findLoan('Geleend', 'Pandemic Legacy: Season 1')
  expect(within(cousinLoan).getByText('te laat')).toBeInTheDocument()
  expect(within(cousinLoan).getByText('Van 7 maart 2019 tot 4 april 2019')).toBeInTheDocument()
  expect(within(cousinLoan).getByText('Te laat sinds 5 april 2019')).toBeInTheDocument()
  expect(within(cousinLoan).getByRole('button', { name: 'Verlengen' })).toBeDisabled()
  expect(within(cousinLoan).getByText('Te laat: verlengen kan niet meer')).toBeInTheDocument()
})

test('een teruggebrachte doos staat als teruggebracht in de lijst', async () => {
  renderRoutes(routes, '/lending/mine?tab=loans')

  const duel = await findLoan('Uitgeleend', '7 Wonders Duel')
  expect(within(duel).getByText('teruggebracht')).toBeInTheDocument()
  expect(
    within(screen.getByRole('region', { name: 'Uitgeleend' })).getAllByRole('listitem'),
  ).toHaveLength(1)
  expect(
    within(screen.getByRole('region', { name: 'Geleend' })).getAllByRole('listitem'),
  ).toHaveLength(1)
})

test('de lener verlengt een lening één keer', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine?tab=loans')

  const gloomhaven = await findLoan('Geleend', 'Gloomhaven')
  await user.click(within(gloomhaven).getByRole('button', { name: 'Verlengen' }))
  const dialog = await screen.findByRole('dialog', { name: 'Lening verlengen' })
  expect(
    within(dialog).getByText(`Uiterlijk ${formatDate(daysFromToday(18))}, 28 dagen na de start.`),
  ).toBeInTheDocument()
  const returnDate = within(dialog).getByLabelText('Nieuwe inleverdatum')
  await user.clear(returnDate)
  await user.type(returnDate, daysFromToday(7))
  await user.click(within(dialog).getByRole('button', { name: 'Verlengen' }))

  expect(await within(gloomhaven).findByText('verlengd')).toBeInTheDocument()
  expect(within(gloomhaven).getByText('Nog 7 dagen')).toBeInTheDocument()
  expect(within(gloomhaven).getByRole('button', { name: 'Verlengen' })).toBeDisabled()
  expect(
    within(gloomhaven).getByText('Je hebt deze lening al een keer verlengd'),
  ).toBeInTheDocument()
})

test('verlengen voorbij de maximale termijn geeft een melding', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending/mine?tab=loans')

  const gloomhaven = await findLoan('Geleend', 'Gloomhaven')
  await user.click(within(gloomhaven).getByRole('button', { name: 'Verlengen' }))
  const dialog = await screen.findByRole('dialog', { name: 'Lening verlengen' })
  const returnDate = within(dialog).getByLabelText('Nieuwe inleverdatum')
  await user.clear(returnDate)
  await user.type(returnDate, daysFromToday(19))
  await user.click(within(dialog).getByRole('button', { name: 'Verlengen' }))

  expect(
    await within(dialog).findByText(`Kies uiterlijk ${formatDate(daysFromToday(18))}`),
  ).toBeInTheDocument()
  expect(within(gloomhaven).queryByText('verlengd')).not.toBeInTheDocument()
})

test('een al verlengde lening kan niet nog een keer verlengd worden', async () => {
  loginAs('m3')
  renderRoutes(routes, '/lending/mine?tab=loans')

  const wingspan = await findLoan('Geleend', 'Wingspan')
  expect(within(wingspan).getByRole('button', { name: 'Verlengen' })).toBeDisabled()
  expect(within(wingspan).getByText('Je hebt deze lening al een keer verlengd')).toBeInTheDocument()
  // Bij wat ik uitleen kan ik niet verlengen, dat doet de lener
  const gloomhaven = await findLoan('Uitgeleend', 'Gloomhaven')
  expect(within(gloomhaven).queryByRole('button', { name: 'Verlengen' })).not.toBeInTheDocument()
})
