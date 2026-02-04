'use client'

// Desabilita prerendering para contornar bug do Next.js 16 com useContext
export const dynamic = 'force-dynamic'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    fontFamily: 'system-ui, sans-serif',
                    backgroundColor: '#0f172a',
                    color: '#fff'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>Algo deu errado!</h2>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            </body>
        </html>
    )
}
