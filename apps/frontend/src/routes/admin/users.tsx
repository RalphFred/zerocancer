import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAdminUsers } from '@/services/providers/admin.provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Heart,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  UserCheck,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  const [search, setSearch] = useState('')
  const [profileType, setProfileType] = useState<'PATIENT' | 'DONOR' | 'ALL'>(
    'ALL',
  )
  const [page, setPage] = useState(1)
  const pageSize = 20

  const {
    data: usersData,
    isLoading,
    error,
  } = useAdminUsers({
    page,
    pageSize,
    search: search.trim() || undefined,
    profileType: profileType === 'ALL' ? undefined : profileType,
  })

  const users = usersData?.data?.users || []
  const totalPages = usersData?.data?.totalPages || 1
  const total = usersData?.data?.total || 0

  const clearFilters = () => {
    setSearch('')
    setProfileType('ALL')
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page when searching
  }

  const handleProfileTypeChange = (value: string) => {
    setProfileType(value as 'PATIENT' | 'DONOR' | 'ALL')
    setPage(1) // Reset to first page when filtering
  }

  // Calculate quick stats
  const patientCount = users.filter((user: any) => user.patientProfile).length
  const donorCount = users.filter((user: any) => user.donorProfile).length
  const verifiedCount = users.filter(
    (user: any) =>
      user.patientProfile?.emailVerified || user.donorProfile?.emailVerified,
  ).length

  const getProfileBadge = (user: any) => {
    if (user.patientProfile) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Patient
        </Badge>
      )
    }
    if (user.donorProfile) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Donor
        </Badge>
      )
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const getVerificationStatus = (user: any) => {
    const isVerified =
      user.patientProfile?.emailVerified || user.donorProfile?.emailVerified
    return isVerified ? (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-amber-600">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Pending</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getLocationInfo = (user: any) => {
    if (user.patientProfile?.state) {
      const parts = []
      if (user.patientProfile.city) parts.push(user.patientProfile.city)
      if (user.patientProfile.state) parts.push(user.patientProfile.state)
      return parts.join(', ')
    }
    if (user.donorProfile?.country) {
      return user.donorProfile.country
    }
    return 'Not specified'
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error Loading Users
              </h3>
              <p className="text-red-700">
                {error?.response?.data?.error ||
                  'Failed to load users. Please try again.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all platform users
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Patients</p>
                <p className="text-xl font-bold">{patientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Donors</p>
                <p className="text-xl font-bold">{donorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-xl font-bold">{verifiedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select
                value={profileType}
                onValueChange={handleProfileTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="PATIENT">Patients Only</SelectItem>
                  <SelectItem value="DONOR">Donors Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(search || profileType !== 'ALL') && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {search || profileType !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'No users have registered yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProfileBadge(user)}
                        {user.donorProfile?.organizationName && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {user.donorProfile.organizationName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                          {getVerificationStatus(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {getLocationInfo(user)}
                        </div>
                      </TableCell>
                      <TableCell>{getVerificationStatus(user)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {user.appointments.length} appointments
                          </div>
                          {user.donationCampaigns.length > 0 && (
                            <div className="text-sm flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {user.donationCampaigns.length} campaigns
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total users)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
