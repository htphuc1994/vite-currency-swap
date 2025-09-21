import SwapForm from './components/SwapForm'

export default function App() {
    return (
        <div className="container">
            <div className="card" role="application" aria-label="Currency swap form">
                <h1 className="title">Swap assets</h1>
                <p className="subtle">
                    Demo UI with live pricing, validation, slippage and a simulated transaction flow.
                </p>
                <SwapForm />
            </div>
        </div>
    )
}