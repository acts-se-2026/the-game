// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'

vi.mock('./components/ArenaCanvas', () => ({
  default: () => <div aria-label="Game arena canvas" />,
}))

afterEach(cleanup)

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('room page flow', () => {
  it('shows the lobby as the main page (server selection)', () => {
    renderRoute('/')

    expect(screen.getByRole('heading', { name: 'Public rooms' })).not.toBeNull()
  })

  it('allows entering the lobby from the loading page username prompt', async () => {
    const user = userEvent.setup()
    renderRoute('/loading')

    await user.click(screen.getByRole('button', { name: 'Enter lobby' }))
    expect(screen.getByRole('alert').textContent).toBe('Enter a username to continue.')

    await user.type(screen.getByLabelText('Username'), 'Alex')
    await user.click(screen.getByRole('button', { name: 'Enter lobby' }))
    expect(screen.getByRole('heading', { name: 'Public rooms' })).not.toBeNull()
    expect(screen.getByText('Playing as Alex')).not.toBeNull()
  })

  it('lets a player join and leave a waiting room', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getAllByRole('button', { name: 'Join room' })[0])
    expect(screen.getByRole('heading', { name: 'Waiting for match' })).not.toBeNull()
    expect(screen.getByText(/Room ID:/)).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Leave room' }))
    expect(screen.getByRole('heading', { name: 'Public rooms' })).not.toBeNull()
  })

  it('gives a room host controls to kick players and start the arena', async () => {
    const user = userEvent.setup()
    renderRoute('/rooms/new')

    expect(screen.getByRole('heading', { name: 'Create a room' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Kick Morgan' })).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Kick Morgan' }))
    expect(screen.queryByText('Morgan')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Start match' }))
    expect(screen.getByRole('heading', { name: 'Game arena' })).not.toBeNull()
    expect(screen.getByLabelText('Game arena canvas')).not.toBeNull()
  })
})