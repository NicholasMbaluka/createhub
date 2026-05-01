import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container">
      <div className="text-center mt-2">
        <h1>CreateHub</h1>
        <p>Simple creator commerce platform</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/auth/login" className="btn-primary" style={{ display: 'inline-block', width: 'auto', marginRight: '1rem' }}>
            Login
          </Link>
          <Link href="/auth/register" className="btn-secondary" style={{ display: 'inline-block' }}>
            Register as Creator
          </Link>
        </div>
      </div>
    </div>
  )
}
