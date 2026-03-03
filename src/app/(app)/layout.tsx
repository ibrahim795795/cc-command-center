import { SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2 className="font-bold text-xl">WalletOS</h2>
        </div>
        <ul className="nav-links">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/cards">Cards</a></li>
          <li><a href="/timeline">Timeline</a></li>
          <li><a href="/bonuses">Bonuses</a></li>
          <li><a href="/points">Points</a></li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          {!userId ? (
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ width: '100%' }}>Sign In</button>
            </SignInButton>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserButton showName={true} />
            </div>
          )}
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
