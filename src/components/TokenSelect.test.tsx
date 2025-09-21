import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TokenSelect from './TokenSelect'
import { TOKENS } from '../lib/tokens'

function getToggle(side: 'from' | 'to' = 'from') {
    // The control button is labelled like "Select from token" or "Select to token"
    return screen.getByRole('button', { name: new RegExp(`^select ${side} token$`, 'i') })
}

describe('TokenSelect', () => {
    test('renders closed by default with correct ARIA', () => {
        const onChange = vi.fn()
        render(<TokenSelect token={TOKENS[0]} onChange={onChange} side="from" />)

        const btn = getToggle('from')
        expect(btn).toBeInTheDocument()
        expect(btn).toHaveAttribute('aria-haspopup', 'listbox')
        expect(btn).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('dialog', { name: /token picker/i })).not.toBeInTheDocument()
    })

    test('opens on click, focuses search, shows all options and marks current as selected', async () => {
        const onChange = vi.fn()
        const current = TOKENS[0] // e.g. ETH
        render(<TokenSelect token={current} onChange={onChange} side="from" />)

        await userEvent.click(getToggle('from'))

        const dialog = await screen.findByRole('dialog', { name: /token picker/i })
        expect(getToggle('from')).toHaveAttribute('aria-expanded', 'true')

        const search = within(dialog).getByRole('textbox', { name: /search token/i })
        await waitFor(() => expect(search).toHaveFocus())

        const listbox = within(dialog).getByRole('listbox')
        const options = within(listbox).getAllByRole('option')
        expect(options.length).toBe(TOKENS.length)

        // The currently selected token should have aria-selected="true"
        const selected = within(listbox).getByRole('option', { selected: true })
        expect(selected).toHaveTextContent(current.symbol)
    })

    test('filters by query (case-insensitive, symbol or name)', async () => {
        const onChange = vi.fn()
        render(<TokenSelect token={TOKENS[0]} onChange={onChange} side="from" />)

        // Open
        await userEvent.click(getToggle('from'))
        const dialog = await screen.findByRole('dialog', { name: /token picker/i })
        const search = within(dialog).getByRole('textbox', { name: /search token/i })

        // Type "us" → should match USDC ("usd coin"), but not ETH
        await userEvent.type(search, 'us')

        const listbox = within(dialog).getByRole('listbox')
        const options = within(listbox).getAllByRole('option')
        // Ensure at least one match and ETH is gone
        expect(options.length).toBeGreaterThan(0)
        // USDC should be present
        expect(within(listbox).getByRole('option', { name: /USDC/i })).toBeInTheDocument()
        // ETH should not match "us"
        expect(within(listbox).queryByRole('option', { name: /ETH/i })).not.toBeInTheDocument()
    })

    test('clicking outside closes the picker', async () => {
        const onChange = vi.fn()
        render(<TokenSelect token={TOKENS[0]} onChange={onChange} side="from" />)

        await userEvent.click(getToggle('from'))
        await screen.findByRole('dialog', { name: /token picker/i })

        // Click outside the component (document.body)
        await userEvent.click(document.body)

        expect(getToggle('from')).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('dialog', { name: /token picker/i })).not.toBeInTheDocument()
    })
})