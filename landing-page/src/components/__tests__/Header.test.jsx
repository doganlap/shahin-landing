import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../Header'

describe('Header Component', () => {
  it('renders header component', () => {
    render(<Header onLoginClick={() => {}} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header onLoginClick={() => {}} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})

