import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

type PrimitiveProps = {
  children?: ReactNode
  className?: string
  [key: string]: unknown
}

const createPrimitive = (testId: string) => {
  return ({ children, className, ...props }: PrimitiveProps) => (
    <div data-testid={testId} className={className} {...props}>
      {children}
    </div>
  )
}

const loadResizable = async (moduleExports: Record<string, unknown>) => {
  vi.resetModules()
  vi.doMock('react-resizable-panels', () => moduleExports)

  return import('@/ui/primitives/resizable')
}

afterEach(() => {
  vi.resetModules()
})

describe('Resizable primitives', () => {
  it('renders with the current Group and Separator exports', async () => {
    const { ResizablePanelGroup, ResizablePanel, ResizableHandle } =
      await loadResizable({
        Group: createPrimitive('group'),
        Panel: createPrimitive('panel'),
        Separator: createPrimitive('separator'),
      })

    const { container } = render(
      <ResizablePanelGroup data-testid="group-shell">
        <ResizablePanel data-testid="panel-shell">Panel</ResizablePanel>
        <ResizableHandle withHandle data-testid="handle-shell" />
      </ResizablePanelGroup>
    )

    expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="resizable-panel"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })

  it('falls back to the legacy PanelGroup and PanelResizeHandle exports', async () => {
    const { ResizablePanelGroup, ResizablePanel, ResizableHandle } =
      await loadResizable({
        PanelGroup: createPrimitive('legacy-group'),
        Panel: createPrimitive('legacy-panel'),
        PanelResizeHandle: createPrimitive('legacy-separator'),
      })

    const { container } = render(
      <ResizablePanelGroup data-testid="legacy-group-shell">
        <ResizablePanel data-testid="legacy-panel-shell">Legacy panel</ResizablePanel>
        <ResizableHandle withHandle data-testid="legacy-handle-shell" />
      </ResizablePanelGroup>
    )

    expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="resizable-panel"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Legacy panel')).toBeInTheDocument()
  })
})
