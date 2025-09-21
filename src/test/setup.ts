import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { vi } from 'vitest'

// crypto polyfill (for tx hash)
Object.defineProperty(globalThis, 'crypto', { value: webcrypto })

// Always return Switcheo-like prices (ETH=2000, USDC=1)
const switcheoResponse = [
    { currency: 'ETH', price: '2000' },
    { currency: 'BTC', price: '65000' },
    { currency: 'USDC', price: '1' },
    { currency: 'SOL', price: '150' },
    { currency: 'MATIC', price: '0.9' },
]

vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => switcheoResponse,
} as any)))