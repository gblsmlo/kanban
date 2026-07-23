import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

class TestPointerEvent extends window.MouseEvent {
  isPrimary: boolean
  pointerId: number

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.isPrimary = init.isPrimary ?? false
    this.pointerId = init.pointerId ?? 0
  }
}

Object.assign(window, { PointerEvent: TestPointerEvent })
Object.assign(globalThis, { PointerEvent: TestPointerEvent })

const { cleanup, fireEvent, render, screen } = await import('@testing-library/react')
const { useHorizontalDragScroll } = await import('./use-horizontal-drag-scroll')

afterEach(cleanup)

function DragScrollSurface() {
  const { isDragging, viewportProps } = useHorizontalDragScroll()

  return (
    <div data-dragging={String(isDragging)} data-testid="viewport" {...viewportProps}>
      <div data-testid="surface">Surface</div>
      <div data-kanban-card-draggable="" data-testid="draggable-card">
        Draggable card
      </div>
      <button type="button">Action</button>
    </div>
  )
}

function prepareViewport() {
  render(<DragScrollSurface />)
  const viewport = screen.getByTestId('viewport')

  Object.defineProperties(viewport, {
    clientWidth: { configurable: true, value: 300 },
    scrollLeft: { configurable: true, value: 120, writable: true },
    scrollWidth: { configurable: true, value: 900 },
  })
  viewport.setPointerCapture = () => undefined
  viewport.hasPointerCapture = () => true
  viewport.releasePointerCapture = () => undefined

  return viewport
}

describe('useHorizontalDragScroll', () => {
  test('scrolls horizontally after a held primary pointer crosses the threshold', () => {
    const viewport = prepareViewport()
    const surface = screen.getByTestId('surface')

    fireEvent.pointerDown(surface, {
      button: 0,
      clientX: 200,
      clientY: 80,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerMove(viewport, {
      clientX: 140,
      clientY: 82,
      pointerId: 1,
    })

    expect(viewport.scrollLeft).toBe(180)
    expect(viewport.getAttribute('data-dragging')).toBe('true')

    fireEvent.pointerUp(viewport, {
      clientX: 140,
      clientY: 82,
      pointerId: 1,
    })

    expect(viewport.getAttribute('data-dragging')).toBe('false')
  })

  test('keeps vertical gestures and interactive targets out of board scrolling', () => {
    const viewport = prepareViewport()
    const surface = screen.getByTestId('surface')

    fireEvent.pointerDown(surface, {
      button: 0,
      clientX: 200,
      clientY: 80,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerMove(viewport, {
      clientX: 190,
      clientY: 130,
      pointerId: 1,
    })
    expect(viewport.scrollLeft).toBe(120)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Action' }), {
      button: 0,
      clientX: 200,
      clientY: 80,
      isPrimary: true,
      pointerId: 2,
    })
    fireEvent.pointerMove(viewport, {
      clientX: 120,
      clientY: 80,
      pointerId: 2,
    })
    fireEvent.pointerDown(screen.getByTestId('draggable-card'), {
      button: 0,
      clientX: 200,
      clientY: 80,
      isPrimary: true,
      pointerId: 3,
    })
    fireEvent.pointerMove(viewport, {
      clientX: 120,
      clientY: 80,
      pointerId: 3,
    })

    expect(viewport.scrollLeft).toBe(120)
  })

  test('suppresses the click emitted by a completed drag', () => {
    const viewport = prepareViewport()
    const surface = screen.getByTestId('surface')

    fireEvent.pointerDown(surface, {
      button: 0,
      clientX: 200,
      clientY: 80,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerMove(viewport, {
      clientX: 140,
      clientY: 80,
      pointerId: 1,
    })
    fireEvent.pointerUp(viewport, {
      clientX: 140,
      clientY: 80,
      pointerId: 1,
    })
    expect(fireEvent.click(surface, { clientX: 140, clientY: 80 })).toBeFalse()
  })
})
