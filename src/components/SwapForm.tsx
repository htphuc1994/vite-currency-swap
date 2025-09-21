import { useEffect, useMemo, useState } from 'react'
import TokenSelect from './TokenSelect'
import { DEFAULT_FROM, DEFAULT_TO, TOKENS, type Token } from '../lib/tokens'
import { fetchUsdPrices } from '../lib/prices'

type Field = { token: Token; amount: string; balance: number }
type Result = { txHash: string; received: number }

function toFloat(s: string) { if (!s) return 0; const n = Number(s); return Number.isFinite(n) ? n : 0 }

export default function SwapForm() {
    const [from, setFrom] = useState<Field>({ token: DEFAULT_FROM, amount: '', balance: 3.4 })
    const [to, setTo] = useState<Field>({ token: DEFAULT_TO, amount: '', balance: 8600 })
    const [slippage, setSlippage] = useState(0.5)
    const [prices, setPrices] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<Result | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function refreshPrices() {
        const keys = TOKENS.map(t => t.key!).filter(Boolean)
        let p = await fetchUsdPrices(keys)
        const missing = TOKENS.map(t => t.coingeckoId!).filter(id => p[id] == null)
        if (missing.length) p = { ...p, ...(await fetchUsdPrices(missing)) }
        setPrices(p)
    }
    useEffect(() => { refreshPrices() }, [])

    const fromPrice = prices[from.token.coingeckoId ?? ''] ?? 0
    const toPrice   = prices[to.token.coingeckoId ?? ''] ?? 0
    const amountIn = toFloat(from.amount)
    const quotedOut = (fromPrice && toPrice) ? (amountIn * fromPrice / toPrice) : 0
    const minReceived = quotedOut * (1 - slippage / 100)

    function flip() {
        setFrom({ token: to.token, amount: '', balance: to.balance })
        setTo({ token: from.token, amount: '', balance: from.balance })
        setResult(null); setError(null)
    }

    function validate() {
        if (submitting) return 'Processing…'
        if (!from.amount) return 'Enter an amount'
        if (!Number.isFinite(amountIn) || amountIn <= 0) return 'Enter a valid amount'
        if (amountIn > from.balance) return `Insufficient ${from.token.symbol} balance`
        if (from.token.symbol === to.token.symbol) return 'Select two different assets'
        if (!fromPrice || !toPrice) return 'Pricing unavailable'
        return null
    }
    const validation = validate()
    const canSubmit = !validation

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return
        setSubmitting(true); setError(null); setResult(null)

        await new Promise(r => setTimeout(r, 1200 + Math.random()*1200))
        if (Math.random() < 0.05) { setError('Swap failed due to a simulated network error. Please try again.'); setSubmitting(false); return }
        setFrom(f => ({ ...f, amount: '' }))
        const tx = crypto.getRandomValues(new Uint32Array(4)).join('')
        setResult({ txHash: tx, received: minReceived })
        setSubmitting(false)
    }

    useEffect(() => {
        if (!amountIn || !fromPrice || !toPrice) { setTo(t => ({ ...t, amount: '' })); return }
        setTo(t => ({ ...t, amount: (quotedOut).toFixed(6) }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from.amount, from.token.symbol, to.token.symbol, prices])

    const rate = useMemo(() => {
        if (!fromPrice || !toPrice) return null
        const v = fromPrice / toPrice
        return `1 ${from.token.symbol} = ${v.toPrecision(6)} ${to.token.symbol}`
    }, [fromPrice, toPrice, from.token.symbol, to.token.symbol])

    return (
        <form className="stack" onSubmit={onSubmit}>
            <div className="row">
                <div className="panel stack" aria-label="From token input">
                    <div className="label">
                        <span>From</span>
                        <span className="subtle">Balance: {from.balance} {from.token.symbol}</span>
                    </div>
                    <div className="amount">
                        <input inputMode="decimal" placeholder="0.00" value={from.amount}
                               onChange={e => setFrom({ ...from, amount: e.target.value })} aria-label="Amount to swap" />
                        <TokenSelect token={from.token} onChange={t => setFrom({ ...from, token: t })} side="from" />
                    </div>
                    <div className="rate">
                        <span>Slippage</span>
                        <div>
                            <input type="range" min={0.1} max={3} step={0.1}
                                   value={slippage} onChange={e => setSlippage(parseFloat(e.target.value))}
                                   aria-label="Slippage tolerance" />
                            {' '}<span className="badge">{slippage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div className="panel stack" aria-label="To token output">
                    <div className="label"><span>To</span><span className="subtle">You receive (est.)</span></div>
                    <div className="amount" aria-live="polite">
                        <input placeholder="0.00" value={to.amount} readOnly aria-readonly />
                        <TokenSelect token={to.token} onChange={t => setTo({ ...to, token: t })} side="to" />
                    </div>
                    <div className="rate" aria-live="polite">
                        <span>{rate ?? 'Price loading…'}</span>
                        <span>Min. received: <b>{minReceived ? minReceived.toFixed(6) : '--'}</b></span>
                    </div>
                </div>
            </div>

            <div className="flip">
                <button className="secondary" type="button" onClick={flip} aria-label="Flip tokens">⇅</button>
            </div>

            {error && <div className="error" role="alert">{error}</div>}
            {result && (
                <div className="success" role="status">
                    Swap complete! Received approximately <b>{result.received.toFixed(6)} {to.token.symbol}</b>.<br/>
                    <small className="subtle">Mock tx hash: {result.txHash}</small>
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" type="submit" disabled={!canSubmit || submitting}>
                    {submitting ? 'Swapping…' : validation ?? 'Swap'}
                </button>
                <button type="button" className="btn secondary" onClick={refreshPrices} disabled={submitting}>
                    Refresh prices
                </button>
            </div>
        </form>
    )
}