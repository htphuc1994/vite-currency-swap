type PriceMap = Record<string, number>

const SWITCHEO_URL = 'https://interview.switcheo.com/prices.json'
const COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'

export async function fetchUsdPrices(idsOrKeys: string[]): Promise<PriceMap> {
    const out: PriceMap = {}

    // 1) Try Switcheo prices.json (keys like 'ETH', 'BTC', etc.)
    try {
        const res = await fetch(SWITCHEO_URL, { cache: 'no-store' })
        if (res.ok) {
            const arr = await res.json() as Array<{ currency: string, price: string }>
            for (const k of idsOrKeys) {
                const found = arr.find(x => x.currency.toUpperCase() === k.toUpperCase())
                if (found) out[k] = Number(found.price)
            }
            if (Object.keys(out).length) return out
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) { /* empty */ }

    // 2) Fallback to CoinGecko IDs
    try {
        const params = new URLSearchParams({ ids: idsOrKeys.join(','), vs_currencies: 'usd' })
        const res = await fetch(`${COINGECKO}?${params.toString()}`)
        if (res.ok) {
            const json = await res.json()
            for (const id of Object.keys(json)) {
                const usd = json[id]?.usd
                if (typeof usd === 'number') out[id] = usd
            }
            if (Object.keys(out).length) return out
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) { /* empty */ }

    // 3) Static fallback so UI still works offline/rate-limited
    const FALLBACK: PriceMap = {
        ETH: 3200, BTC: 65000, USDC: 1, SOL: 150, MATIC: 0.9,
        'ethereum': 3200, 'bitcoin': 65000, 'usd-coin': 1, 'solana': 150, 'matic-network': 0.9
    }
    for (const k of idsOrKeys) if (FALLBACK[k] != null) out[k] = FALLBACK[k]
    return out
}