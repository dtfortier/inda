import { useState } from 'react'

const PASSWORD = import.meta.env.VITE_PASSWORD

export function Login({ onSuccess }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem('inda_auth', '1')
      onSuccess()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f4f4',
        fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '320px',
          padding: '32px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(35,68,101,0.15), 0 4px 12px rgba(35,68,101,0.10)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Inclusive Sans', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#273540',
          }}
        >
          Enter password
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#576773' }}>
          This is a protected preview of the Insights Dashboard.
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(false)
          }}
          placeholder="Password"
          autoFocus
          style={{
            padding: '10px 12px',
            fontSize: '15px',
            border: error ? '1.5px solid #e53e3e' : '1px solid #6a7883',
            borderRadius: '12px',
            outline: 'none',
            color: '#273540',
          }}
        />
        {error && (
          <p style={{ margin: 0, color: '#e53e3e', fontSize: '13px' }}>
            Incorrect password — try again
          </p>
        )}
        <button
          type="submit"
          style={{
            padding: '10px',
            fontSize: '15px',
            fontWeight: 600,
            backgroundColor: '#1d354f',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </form>
    </div>
  )
}
