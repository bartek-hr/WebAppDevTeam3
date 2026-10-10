import { Tab, Tabs } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import MyBoxesTab from './MyBoxesTab'
import MyRequestsTab from './MyRequestsTab'

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function MyLendingPage() {
  // De open tab staat in de URL, zodat je er direct naartoe kunt linken
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'boxes'

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h1 className="mb-0">Mijn uitleningen</h1>
      </div>
      <p className="text-body-secondary">
        Beoordeel aanvragen op je eigen dozen en volg de dozen die je zelf hebt aangevraagd.
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
      </Tabs>
    </>
  )
}
