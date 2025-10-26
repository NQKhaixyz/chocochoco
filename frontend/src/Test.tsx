export default function Test() {
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>TEST PAGE - If you see this, React is working!</h1>
      <p>Frontend is rendering correctly.</p>
      <p>Environment variables:</p>
      <ul>
        <li>VITE_SOLANA_CLUSTER: {import.meta.env.VITE_SOLANA_CLUSTER}</li>
        <li>VITE_PROGRAM_ID: {import.meta.env.VITE_PROGRAM_ID}</li>
      </ul>
    </div>
  )
}
