import { http, HttpResponse, type HttpHandler } from 'msw'
import { getCurrentMember } from '../auth/mocks'
import { wishlistsPreviewItems } from './wishlistsPreviewData'

export const wishlistsPreviewHandlers: HttpHandler[] = [
  http.get('/api/wishlists-preview', ({ request }) => {
    if (!getCurrentMember(request)) {
      return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    }
    return HttpResponse.json(wishlistsPreviewItems)
  }),
]
