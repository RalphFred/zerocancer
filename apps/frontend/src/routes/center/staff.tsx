import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthUser } from '@/services/providers/auth.provider'
import {
  centerById,
  staffInvites,
  useInviteStaff,
} from '@/services/providers/center.provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { inviteStaffSchema } from '@zerocancer/shared/schemas/center.schema'
import {
  ChevronDown,
  Clock,
  Download,
  Flag,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, type FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { cn } from '@/lib/utils'
import peopleIcon from '@/assets/images/people.png'
import megaphoneIcon from '@/assets/images/megaphone.png'
import complianceIcon from '@/assets/images/view.png'

export const Route = createFileRoute('/center/staff')({
  component: CenterStaff,
})

type InviteStaffForm = z.infer<typeof inviteStaffSchema> & FieldValues

function CenterStaff() {
  const queryClient = useQueryClient()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [filter, setFilter] = useState('All Staff')
  const [searchTerm, setSearchTerm] = useState('')

  // Get current authenticated center info
  const authUserQuery = useQuery(useAuthUser())
  const user = authUserQuery.data?.data?.user
  const centerId = user?.id

  // Get center details including staff
  const { data: centerData, isLoading: centerLoading } = useQuery({
    ...centerById(centerId!),
    enabled: !!centerId,
  })

  // Get pending staff invites
  const { data: staffInvitesData, isLoading: invitesLoading } = useQuery({
    ...staffInvites(),
    enabled: !!centerId,
  })

  const center = centerData?.data
  const activeStaff = center?.staff || []
  const pendingInvites = staffInvitesData?.data?.invites || []

  const allStaff = useMemo(() => {
    const combined = [
      ...activeStaff.map((member) => ({
        id: member.id,
        name: member.email.split('@')[0],
        staffId: member.id.slice(0, 8),
        email: member.email,
        lastCheckin: 'Jul 10, 2025', // Placeholder
        status: 'Active',
      })),
      ...pendingInvites.map((invite) => ({
        id: invite.token,
        name: invite.email.split('@')[0],
        staffId: 'N/A',
        email: invite.email,
        lastCheckin: 'N/A',
        status:
          invite.expiresAt && new Date(invite.expiresAt) < new Date()
            ? 'Expired'
            : 'Invited',
      })),
    ]
    return combined
  }, [activeStaff, pendingInvites])

  const filteredStaff = useMemo(() => {
    return allStaff
      .filter((staff) => {
        if (filter === 'All Staff') return true
        return staff.status === filter
      })
      .filter((staff) =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
  }, [allStaff, filter, searchTerm])

  const inviteStaffMutation = useInviteStaff()

  const form = useForm<InviteStaffForm>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      centerId: centerId || '',
      emails: [''],
    },
  })

  const { fields, append, remove } = useFieldArray<InviteStaffForm, 'emails'>({
    control: form.control,
    name: 'emails',
  })

  useEffect(() => {
    if (centerId) {
      form.setValue('centerId', centerId)
    }
  }, [centerId, form])

  const onInviteStaff = async (data: InviteStaffForm) => {
    const validEmails = data.emails.filter((email) => email.trim())
    if (validEmails.length === 0) {
      toast.error('Please add at least one email address')
      return
    }

    inviteStaffMutation.mutate(
      { centerId: data.centerId, emails: validEmails },
      {
        onSuccess: () => {
          toast.success(`Successfully sent ${validEmails.length} invitation(s)`)
          form.reset({ centerId: data.centerId, emails: [''] })
          setInviteDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['staffInvites'] })
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || 'Failed to send invitations',
          )
        },
      },
    )
  }

  const addEmailField = () => append('')
  const removeEmailField = (index: number) => {
    if (fields.length > 1) remove(index)
  }

  const stats = [
    {
      title: 'Total Staff',
      value: allStaff.length,
      description: 'People',
      icon: peopleIcon,
      color: 'bg-red-100',
    },
    {
      title: 'Total Active Staff',
      value: activeStaff.length,
      description: 'People',
      icon: peopleIcon,
      color: 'bg-blue-100',
    },
    {
      title: 'Pending Invites',
      value: pendingInvites.length,
      description: 'People',
      icon: megaphoneIcon,
      color: 'bg-purple-100',
    },
  ]

  const quickActions = [
    { label: 'Invite Staff', icon: UserPlus, primary: true },
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500'
      case 'Invited':
        return 'bg-gray-400'
      // case 'Suspended':
      case 'Expired':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Staff</h1>
          <p className="text-muted-foreground">
            Invite and manage staff members for{' '}
            {center?.centerName || 'your center'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className={cn('border-0', stat.color)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-white rounded-full">
                <img src={stat.icon} alt={stat.title} className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.primary ? 'default' : 'outline'}
            className={cn('h-24 flex-col gap-2', {
              'bg-primary text-white hover:bg-primary/80': action.primary,
              'bg-gray-100 hover:bg-gray-200': !action.primary,
            })}
            onClick={() =>
              action.label === 'Invite Staff' && setInviteDialogOpen(true)
            }
            disabled={action.label !== 'Invite Staff'}
          >
            <action.icon className="h-6 w-6" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="All Staff">All Staff</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Invited">Invited</TabsTrigger>
            {/* <TabsTrigger value="Suspended">Suspended</TabsTrigger> */}
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredStaff.length} of {allStaff.length} staff members
      </p>

      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50 hover:bg-blue-100">
            <TableHead>Staff Name</TableHead>
            <TableHead>Staff ID</TableHead>
            <TableHead>Staff Email</TableHead>
            <TableHead>Last Check-in</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(centerLoading || invitesLoading) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading staff...
              </TableCell>
            </TableRow>
          )}
          {!centerLoading && !invitesLoading && filteredStaff.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No staff members found.
              </TableCell>
            </TableRow>
          )}
          {filteredStaff.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {member.staffId}
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.lastCheckin}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    'text-white border-transparent',
                    getStatusBadgeClass(member.status),
                  )}
                >
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem disabled>Manage Roles</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Staff Members</DialogTitle>
            <DialogDescription>
              Enter email addresses to invite new staff members to your center.
              They'll receive an email with instructions to set up their
              account.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onInviteStaff)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="centerId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Email Addresses</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmailField}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Email
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`emails.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="colleague@example.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeEmailField(index)}
                          className="shrink-0 mt-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <FormDescription>
                  Staff members will be able to verify check-ins, upload
                  results, and access center management features.
                </FormDescription>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteStaffMutation.isPending}>
                  {inviteStaffMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending Invites...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
