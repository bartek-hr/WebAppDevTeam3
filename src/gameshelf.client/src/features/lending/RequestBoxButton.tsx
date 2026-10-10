import { Alert, Button } from 'react-bootstrap'
import { Check2, Send } from 'react-bootstrap-icons'
import { getErrorMessage } from '../../api/errors'
import type { Box } from '../../types'
import { useRequestBox } from './api'

interface RequestBoxButtonProps {
  box: Box
  // Ik heb al een aanvraag in afwachting op deze doos
  isRequested: boolean
}

// Knop voor een beschikbare doos van iemand anders
export default function RequestBoxButton({ box, isRequested }: RequestBoxButtonProps) {
  const requestBox = useRequestBox()

  if (isRequested) {
    return (
      <div className="mt-2">
        <Button size="sm" variant="outline-secondary" disabled>
          <Check2 className="me-1" />
          Aangevraagd
        </Button>
        <div className="small text-body-secondary mt-1">
          De eigenaar moet je aanvraag nog beoordelen
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <Button
        size="sm"
        variant="outline-primary"
        disabled={requestBox.isPending}
        onClick={() => requestBox.mutate(box.id)}
      >
        <Send className="me-1" />
        {requestBox.isPending ? 'Bezig met aanvragen…' : 'Aanvragen'}
      </Button>
      {requestBox.isError && (
        <Alert variant="danger" className="small p-2 mt-2 mb-0">
          {getErrorMessage(requestBox.error)}
        </Alert>
      )}
    </div>
  )
}
