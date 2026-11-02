import Alert from '../../components/Alert'
import { CheckIcon, SendIcon } from '../../components/icons'
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
      <div className="lending-space-top">
        <button type="button" className="btn btn--outline-secondary btn--sm" disabled>
          <CheckIcon />
          Aangevraagd
        </button>
        <div className="text-small text-muted lending-hint">
          De eigenaar moet je aanvraag nog beoordelen
        </div>
      </div>
    )
  }

  return (
    <div className="lending-space-top">
      <button
        type="button"
        className="btn btn--outline-primary btn--sm"

        disabled={requestBox.isPending}
        onClick={() => requestBox.mutate(box.id)}
      >
        <SendIcon />
        {requestBox.isPending ? 'Bezig met aanvragen…' : 'Aanvragen'}
      </button>
      {requestBox.isError && (
        <Alert variant="danger" className="text-small lending-space-top">
          {getErrorMessage(requestBox.error)}
        </Alert>
      )}
    </div>
  )
}
