import { useEffect, useMemo, useRef, useState } from 'react'
import { TOKENS, type Token } from '../lib/tokens'

type Props = { token: Token; onChange: (t: Token) => void; side: 'from' | 'to' }

export default function TokenSelect({ token, onChange, side }: Props) {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase()
        if (!qq) return TOKENS
        return TOKENS.filter(t => t.symbol.toLowerCase().includes(qq) || t.name.toLowerCase().includes(qq))
    }, [q])

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return
            if (!ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" className="token" aria-haspopup="listbox" aria-expanded={open}
                    aria-label={`Select ${side} token`} onClick={() => setOpen(!open)}>
                <img src={token.image} alt="" />
                <span>{token.symbol}</span>
                <span className="chev" aria-hidden>▾</span>
            </button>

            {open && (
                <div className="picker" role="dialog" aria-label="Token picker">
                    <input placeholder="Search token or ticker…" autoFocus value={q}
                           onChange={e => setQ(e.target.value)} aria-label="Search token" />
                    <ul role="listbox">
                        {filtered.map(t => (
                            <li key={t.symbol} role="option" aria-selected={t.symbol === token.symbol}
                                onClick={() => { onChange(t); setOpen(false); setQ('') }}>
                                <img src={t.image} alt="" width={20} height={20} />
                                <div>
                                    <div style={{ fontWeight: 700 }}>{t.symbol}</div>
                                    <div className="subtle">{t.name}</div>
                                </div>
                                <div className="badge">#{t.decimals}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}