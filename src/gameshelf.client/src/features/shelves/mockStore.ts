import type { Shelf } from '../../types'

// Losse opslag voorkomt een kringverwijzing tussen collectie- en plank-endpoints.
export const shelves: Shelf[] = [
  {
    id: 1,
    ownerId: 'm1',
    name: 'Favorieten',
    description: 'Games die altijd op tafel mogen.',
    isPublic: true,
    recordIds: [1, 2, 3],
  },
  {
    id: 2,
    ownerId: 'm1',
    name: 'Voor later',
    description: 'Nog eens uitzoeken.',
    isPublic: false,
    recordIds: [2, 4],
  },
  {
    id: 3,
    ownerId: 'm2',
    name: 'Campagnes',
    description: 'Met de dinsdaggroep.',
    isPublic: true,
    recordIds: [5, 6, 7],
  },
  {
    id: 4,
    ownerId: 'm2',
    name: 'Partyspellen',
    description: 'Voor een gezellige clubavond.',
    isPublic: true,
    recordIds: [8, 11],
  },
  {
    id: 5,
    ownerId: 'm2',
    name: 'Mijn geheime favorieten',
    description: 'Alleen voor mij.',
    isPublic: false,
    recordIds: [8, 9],
  },
  {
    id: 6,
    ownerId: 'm3',
    name: 'Voor twee',
    description: 'Een rustige avond samen.',
    isPublic: true,
    recordIds: [13, 14],
  },
]
