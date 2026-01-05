import { createFileRoute } from '@tanstack/react-router'
import WebDashboard from '../components/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome to TaskManager!</h3>
      <WebDashboard />
    </div>
  )
}
