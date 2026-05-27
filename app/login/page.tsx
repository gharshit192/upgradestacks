// app/login/page.tsx
// Login page

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Log In — UpgradeStacks',
}

import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
