// src/components/SwapForm.test.tsx
import { describe, test, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SwapForm from './SwapForm'

// Helpers
function getInputs() {
    const [fromInput, toInput] = screen.getAllByPlaceholderText('0.00') as HTMLInputElement[]
    return { fromInput, toInput }
}
function getRateText(): string {
    // Grab the rate line like "1 ETH = 3200.00 USDC" or "1 USDC = 0.000312500 ETH"
    const el = screen.getByText((content) => /^1\s+[A-Z]+?\s=\s[\d.]+\s+[A-Z]+$/.test(content))
    return el.textContent || ''
}
function parseRate(text: string) {
    // "1 ETH = 3200.00 USDC" → { base: "ETH", quote: "USDC", value: 3200 }
    const m = text.match(/^1\s+([A-Z]+)\s=\s([\d.]+)\s+([A-Z]+)$/)
    if (!m) throw new Error('Rate text not found or unexpected format: ' + text)
    return { base: m[1], value: parseFloat(m[2]), quote: m[3] }
}

describe('SwapForm', () => {
    test('renders and shows initial validation', async () => {
        render(<SwapForm />)

        // Initial validation
        expect(screen.getByRole('button', { name: /enter an amount/i })).toBeInTheDocument()

        // Prices load and a rate appears
        await waitFor(() => {
            const rateText = getRateText()
            expect(rateText).toMatch(/^1 [A-Z]+ = [\d.]+ [A-Z]+$/)
        })
    })

    test('computes quote, to-amount and min received from ETH→USDC', async () => {
        render(<SwapForm />)

        await waitFor(() => getRateText())
        const rate1 = parseRate(getRateText())
        // Should be ETH -> USDC initially
        expect(rate1.base).toBe('ETH')
        expect(rate1.quote).toBe('USDC')

        const { fromInput, toInput } = getInputs()
        await userEvent.clear(fromInput)
        await userEvent.type(fromInput, '1.5') // 1.5 ETH

        const expectedOut = 1.5 * rate1.value
        await waitFor(() => {
            expect(toInput.value).toBe(expectedOut.toFixed(6))
        })

        // Min received = quotedOut * (1 - slippage), slippage default = 0.5%
        const minReceived = expectedOut * (1 - 0.5 / 100)
        const minText = screen.getByText(/Min\. received:/i).textContent || ''
        expect(minText).toContain(minReceived.toFixed(6))
    })

    test('flip updates the displayed rate (reciprocal)', async () => {
        render(<SwapForm />)
        await waitFor(() => getRateText())
        const before = parseRate(getRateText()) // 1 ETH = X USDC

        // Flip tokens
        await userEvent.click(screen.getByRole('button', { name: /flip tokens/i }))

        await waitFor(() => {
            const afterTxt = getRateText() // 1 USDC = Y ETH
            const after = parseRate(afterTxt)
            expect(after.base).toBe('USDC')
            expect(after.quote).toBe('ETH')
            // Y should be ~ 1 / X
            expect(after.value).toBeCloseTo(1 / before.value, 6)
        })
    })
})