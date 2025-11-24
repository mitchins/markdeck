import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeProvider } from '@/components/theme-provider'

const renderWithThemeProvider = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {ui}
    </ThemeProvider>
  )
}

afterEach(() => {
  window.localStorage.removeItem('theme')
  document.documentElement.classList.remove('light', 'dark')
})

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  it('allows selecting dark theme', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)
    
    const darkOption = await screen.findByText('Dark')
    await user.click(darkOption)
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('allows selecting light theme', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)
    
    const lightOption = await screen.findByText('Light')
    await user.click(lightOption)
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('has proper accessibility attributes', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })
})
