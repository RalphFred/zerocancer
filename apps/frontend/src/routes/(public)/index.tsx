import LandingPage from '@/components/LandingPage/LandingPage.component'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/')({
  component: App,
})

function App() {
  return <LandingPage />
}
