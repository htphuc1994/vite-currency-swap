import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('./components/SwapForm', () => ({
    default: () => <div data-testid="swapform-mock">Mock SwapForm</div>,
}))

// Import AFTER the mock
import App from './App'

afterEach(() => {
    vi.clearAllMocks()
})

describe('App', () => {
    test('renders app shell with title, description, and application region', () => {
        render(<App />)

        // Title
        const heading = screen.getByRole('heading', { level: 1, name: /swap assets/i })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveClass('title')

        // Description
        expect(
            screen.getByText(/demo ui with live pricing, validation, slippage/i)
        ).toBeInTheDocument()

        // ARIA application region
        const appRegion = screen.getByRole('application', { name: /currency swap form/i })
        expect(appRegion).toBeInTheDocument()

        // Basic structure (class hooks for layout/styling)
        expect(document.querySelector('.container')).not.toBeNull()
        expect(document.querySelector('.card')).not.toBeNull()
    })

    test('renders SwapForm exactly once', () => {
        render(<App />)
        const mocked = screen.getAllByTestId('swapform-mock')
        expect(mocked).toHaveLength(1)
        expect(mocked[0]).toHaveTextContent('Mock SwapForm')
    })
})