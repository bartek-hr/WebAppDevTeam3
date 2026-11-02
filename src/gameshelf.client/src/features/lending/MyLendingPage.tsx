import { useRef } from 'react'
import './lending.css'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import CommitteeLoansTab from './CommitteeLoansTab'
import LoansTab from './LoansTab'
import MyBoxesTab from './MyBoxesTab'
import MyRequestsTab from './MyRequestsTab'

const tabs = ['boxes', 'requests', 'loans']
const labels: Record<string, string> = {
  boxes: 'Mijn dozen',
  requests: 'Mijn aanvragen',
  loans: 'Leningen',
  committee: 'Bestuur',
}

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function MyLendingPage() {
  const { isCommittee } = useAuth()
  const tabListRef = useRef<HTMLDivElement>(null)
  // Alleen het bestuur ziet de tab Bestuur
  const availableTabs = isCommittee ? [...tabs, 'committee'] : tabs
  // De open tab staat in de URL, zodat je er direct naartoe kunt linken; onbekend wordt Mijn dozen
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && availableTabs.includes(tabParam) ? tabParam : 'boxes'

  return (
    <>
      <div className="page-header">
        <h1>Mijn uitleningen</h1>
      </div>
      <p className="text-muted">
        Beoordeel aanvragen op je eigen dozen, volg de dozen die je zelf hebt aangevraagd en houd je
        leningen bij.
      </p>

      <div className="lending-tabs" role="tablist" aria-label="Mijn uitleningen" ref={tabListRef}>
        {availableTabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`lending-tab-${tab}`}
            aria-controls={`lending-panel-${tab}`}
            aria-selected={activeTab === tab}
            tabIndex={activeTab === tab ? 0 : -1}
            className="lending-tabs__tab"
            onClick={() => setSearchParams({ tab }, { replace: true })}
            onKeyDown={(event) => {
              let next = index
              if (event.key === 'ArrowRight') next = (index + 1) % availableTabs.length
              else if (event.key === 'ArrowLeft')
                next = (index - 1 + availableTabs.length) % availableTabs.length
              else if (event.key === 'Home') next = 0
              else if (event.key === 'End') next = availableTabs.length - 1
              else return
              event.preventDefault()
              setSearchParams({ tab: availableTabs[next] }, { replace: true })
              tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
            }}
          >
            {labels[tab]}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`lending-panel-${activeTab}`}
        aria-labelledby={`lending-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'boxes' && <MyBoxesTab />}
        {activeTab === 'requests' && <MyRequestsTab />}
        {activeTab === 'loans' && <LoansTab />}
        {activeTab === 'committee' && <CommitteeLoansTab />}
      </div>
    </>
  )
}
