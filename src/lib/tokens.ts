export type Token = {
    symbol: string
    name: string
    coingeckoId?: string
    decimals: number
    image: string
    key?: string // used by Switcheo prices.json
}

export const TOKENS: Token[] = [
    { symbol: 'ETH',   name: 'Ethereum',   coingeckoId: 'ethereum',       decimals: 18, image: '/tokens/ETH.svg',   key: 'ETH' },
    { symbol: 'BTC',   name: 'Bitcoin',    coingeckoId: 'bitcoin',        decimals: 8,  image: '/tokens/BTC.svg',   key: 'BTC' },
    { symbol: 'USDC',  name: 'USD Coin',   coingeckoId: 'usd-coin',       decimals: 6,  image: '/tokens/USDC.svg',  key: 'USDC' },
    { symbol: 'SOL',   name: 'Solana',     coingeckoId: 'solana',         decimals: 9,  image: '/tokens/SOL.svg',   key: 'SOL' },
    { symbol: 'MATIC', name: 'Polygon',    coingeckoId: 'matic-network',  decimals: 18, image: '/tokens/MATIC.svg', key: 'MATIC' },
]

export const DEFAULT_FROM = TOKENS[0]
export const DEFAULT_TO = TOKENS[2]