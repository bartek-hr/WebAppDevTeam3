import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Member } from '../../types'

// Eigenaar: Floris. Mockleden, ook bedoeld voor de mocks van de andere features (gebruik de id's).
export const members: Member[] = [
  { id: 'm1', userName: 'sanne', email: 'sanne@gameshelf.test', isCommittee: true },
  { id: 'm2', userName: 'daan', email: 'daan@gameshelf.test', isCommittee: false },
  { id: 'm3', userName: 'noor', email: 'noor@gameshelf.test', isCommittee: false },
  { id: 'm4', userName: 'thijs', email: 'thijs@gameshelf.test', isCommittee: false },
  { id: 'm5', userName: 'lotte', email: 'lotte@gameshelf.test', isCommittee: true },
  { id: 'm6', userName: 'milan', email: 'milan@gameshelf.test', isCommittee: false },
]

const tokenFor = (member: Member) => `mock-token-${member.id}`

// Wie doet dit verzoek? Te gebruiken in de mocks van andere features, bijv.:
//   const me = getCurrentMember(request)
//   if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
export function getCurrentMember(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  return members.find((member) => tokenFor(member) === token)
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

interface LoginBody {
  userNameOrEmail: string
  password: string
}

interface RegisterBody {
  userName: string
  email: string
  password: string
}

export const authHandlers: HttpHandler[] = [
  // In de mock is elk wachtwoord goed, alleen het lid moet bestaan
  http.post('/api/auth/login', async ({ request }) => {
    const { userNameOrEmail } = (await request.json()) as LoginBody
    const member = members.find(
      (m) => sameText(m.userName, userNameOrEmail) || sameText(m.email, userNameOrEmail),
    )
    if (!member) {
      return HttpResponse.json(
        { message: 'Gebruikersnaam/e-mailadres of wachtwoord klopt niet.' },
        { status: 401 },
      )
    }
    return HttpResponse.json({ token: tokenFor(member), member })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { userName, email } = (await request.json()) as RegisterBody
    if (members.some((m) => sameText(m.userName, userName))) {
      return HttpResponse.json(
        { message: 'Deze gebruikersnaam is al in gebruik.' },
        { status: 409 },
      )
    }
    if (members.some((m) => sameText(m.email, email))) {
      return HttpResponse.json(
        { message: 'Er is al een account met dit e-mailadres.' },
        { status: 409 },
      )
    }
    const member: Member = {
      id: `m${members.length + 1}`,
      userName: userName.trim(),
      email: email.trim(),
      isCommittee: false,
    }
    members.push(member)
    return HttpResponse.json({ token: tokenFor(member), member }, { status: 201 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const member = getCurrentMember(request)
    return member
      ? HttpResponse.json(member)
      : HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
  }),

  http.get('/api/members', () => HttpResponse.json(members)),

  http.get('/api/members/:id', ({ params }) => {
    const member = members.find((m) => m.id === params.id)
    return member
      ? HttpResponse.json(member)
      : HttpResponse.json({ message: 'Lid niet gevonden' }, { status: 404 })
  }),
]
