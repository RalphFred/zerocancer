import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/roles')({
  component: AdminRoles,
})

function AdminRoles() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Assign Roles</h1>
      <p>Here you can assign internal admin roles.</p>
    </div>
  )
} 