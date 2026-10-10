import { Tab, Tabs } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import CommitteeLoansTab from './CommitteeLoansTab'
import LoansTab from './LoansTab'
import MyBoxesTab from './MyBoxesTab'
import MyRequestsTab from './MyRequestsTab'

const tabs = ['boxes', 'requests', 'loans']

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function MyLendingPage() {
  const { isCommittee } = useAuth()
  // Alleen het bestuur ziet de tab Bestuur
  const availableTabs = isCommittee ? [...tabs, 'committee'] : tabs
  // De open tab staat in de URL, zodat je er direct naartoe kunt linken; onbekend wordt Mijn dozen
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && availableTabs.includes(tabParam) ? tabParam : 'boxes'

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h1 className="mb-0">Mijn uitleningen</h1>
      </div>
      <p className="text-body-secondary">
        Beoordeel aanvragen op je eigen dozen, volg de dozen die je zelf hebt aangevraagd en houd je
        leningen bij.
      </p>

      <Tabs
        id="my-lending-tabs"
        activeKey={activeTab}
        onSelect={(tab) => setSearchParams({ tab: tab ?? 'boxes' }, { replace: true })}
        mountOnEnter
        className="mb-3"
      >
        <Tab eventKey="boxes" title="Mijn dozen">
          <MyBoxesTab />
        </Tab>
        <Tab eventKey="requests" title="Mijn aanvragen">
          <MyRequestsTab />
        </Tab>
        <Tab eventKey="loans" title="Leningen">
          <LoansTab />
        </Tab>
        {isCommittee && (
          <Tab eventKey="committee" title="Bestuur">
            <CommitteeLoansTab />
          </Tab>
        )}
      </Tabs>
    </>
  )
}
