import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { CardDetailDrawer } from '@/components/CardDetailDrawer'
import { useAppStore } from '@/application/state/app-store'
import type { Card } from '@/core'

const baseCard: Card = {
  id: 'card-1',
  title: 'Test card',
  status: 'todo',
  blocked: false,
  laneId: 'lane-1',
  description: '',
  links: [],
  originalLine: 0,
  originalFormat: 'checkbox',
}

describe('CardDetailDrawer', () => {
  beforeAll(() => {
    // Radix Select expects these pointer APIs for open/close behavior
    window.HTMLElement.prototype.hasPointerCapture = () => false
    window.HTMLElement.prototype.releasePointerCapture = () => {}
  })

  beforeEach(() => {
    useAppStore.getState().actions.reset()
  })

  it('hides in-progress status when board is in simple mode', async () => {
    useAppStore.setState((state) => ({
      ...state,
      project: {
        metadata: { title: 'Test Project' },
        cards: [baseCard],
        swimlanes: [{ id: 'lane-1', title: 'Lane 1', order: 0 }],
        notes: [],
        rawMarkdown: '',
        boardMode: 'simple',
      },
    }))

    render(<CardDetailDrawer card={baseCard} open onClose={() => {}} onSave={() => {}} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'TODO' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'DONE' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'IN PROGRESS' })).not.toBeInTheDocument()
  })

  it('normalizes existing in-progress cards to todo when editing in simple mode', () => {
    const inProgressCard: Card = { ...baseCard, id: 'card-2', status: 'in_progress' }

    useAppStore.setState((state) => ({
      ...state,
      project: {
        metadata: { title: 'Test Project' },
        cards: [inProgressCard],
        swimlanes: [{ id: 'lane-1', title: 'Lane 1', order: 0 }],
        notes: [],
        rawMarkdown: '',
        boardMode: 'simple',
      },
    }))

    render(<CardDetailDrawer card={inProgressCard} open onClose={() => {}} onSave={() => {}} />)

    expect(screen.getByRole('combobox')).toHaveTextContent('TODO')
  })
})
