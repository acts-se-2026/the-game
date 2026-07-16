// @vitest-environment jsdom

import { StrictMode } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ArenaState } from '../game/types'

const pixiMock = vi.hoisted(() => {
  const pendingInitializations: Array<() => void> = []

  class Container {
    children: Array<{ name?: string }> = []
    eventMode = ''
    hitArea: unknown = null
    name = ''
    rotation = 0
    x = 0
    y = 0

    addChild(...children: Array<{ name?: string }>) {
      this.children.push(...children)
      return children[0]
    }

    getChildByName(name: string) {
      return this.children.find((child) => child.name === name)
    }

    removeChildren() {
      const children = this.children
      this.children = []
      return children
    }

    on() {
      return this
    }

    destroy() {}
  }

  class Graphics {
    name = ''
    clear() { return this }
    rect() { return this }
    ellipse() { return this }
    fill() { return this }
    moveTo() { return this }
    lineTo() { return this }
    stroke() { return this }
    circle() { return this }
    closePath() { return this }
    destroy() {}
  }

  class Application {
    canvas!: HTMLCanvasElement
    initialized = false
    screen = {}
    stage = new Container()

    init() {
      return new Promise<void>((resolve) => {
        pendingInitializations.push(() => {
          this.canvas = document.createElement('canvas')
          this.initialized = true
          resolve()
        })
      })
    }

    destroy() {
      if (!this.initialized) throw new Error('Pixi was destroyed before initialization completed')
      this.canvas.remove()
    }

    render() {}
  }

  return {
    Application,
    Container,
    Graphics,
    resolveInitializations() {
      pendingInitializations.splice(0).forEach((resolve) => resolve())
    },
  }
})

vi.mock('pixi.js', () => pixiMock)

import ArenaCanvas from '../pages/rooms/[roomId]/arena/components/ArenaCanvas'

const arena: ArenaState = {
  obstacles: [{ id: 'wall', x: 100, y: 100, size: 80 }],
  players: [{ id: 'you', x: 200, y: 200, heading: 0, color: '#60a5fa', isLocal: true }],
  bullets: [],
}

afterEach(cleanup)

describe('ArenaCanvas', () => {
  it('finishes asynchronous Pixi startup during a Strict Mode remount', async () => {
    const view = render(
      <StrictMode>
        <ArenaCanvas state={arena} />
      </StrictMode>,
    )

    await act(async () => {
      pixiMock.resolveInitializations()
      await Promise.resolve()
    })

    expect(view.getByRole('application').querySelectorAll('canvas')).toHaveLength(1)
  })
})