'use client';

/**
 * Employee/Staff Management Dashboard
 * Manage agents, representatives, and staff with licensing tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  UserCog,
  Search,
  MoreVertical,
  Shield,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { teamApi } from '@/lib/api';
import { toast } from 'sonner';
import type { EmployeeRole, EmployeeStatus, CertificationStatus } from '@/types/employee';

// Demo data for employees
const demoEmployees = [
  {
    id: 'emp-1',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    email: 'marcus@healthshield.com',
    phone: '(512) 555-0101',
    photo: null,
    role: 'agent' as EmployeeRole,
    type: 'employee' as const,
    status: 'active' as EmployeeStatus,
    hireDate: '2022-03-15',
    hourlyRate: 35,
    rating: 4.9,
    totalShifts: 245,
    preferredLocation: 'regional' as const,
    certifications: [
      { id: 'cert-1', type: 'USCG-OUPV', name: 'USCG OUPV License', expiryDate: '2025-06-15', status: 'valid' as CertificationStatus },
      { id: 'cert-2', type: 'CPR-FirstAid', name: 'CPR/First Aid', expiryDate: '2024-02-28', status: 'expiring-soon' as CertificationStatus },
    ],
  },
  {
    id: 'emp-2',
    firstName: 'Jessica',
    lastName: 'Chen',
    email: 'jessica@healthshield.com',
    phone: '(512) 555-0102',
    photo: null,
    role: 'agent' as EmployeeRole,
    type: 'employee' as const,
    status: 'active' as EmployeeStatus,
    hireDate: '2021-08-20',
    hourlyRate: 38,
    rating: 4.8,
    totalShifts: 312,
    preferredLocation: 'regional' as const,
    certifications: [
      { id: 'cert-3', type: 'USCG-Master', name: 'USCG Master License', expiryDate: '2026-01-10', status: 'valid' as CertificationStatus },
      { id: 'cert-4', type: 'CPR-FirstAid', name: 'CPR/First Aid', expiryDate: '2024-08-15', status: 'valid' as CertificationStatus },
    ],
  },
  {
    id: 'emp-3',
    firstName: 'Tyler',
    lastName: 'Johnson',
    email: 'tyler@healthshield.com',
    phone: '(512) 555-0103',
    photo: null,
    role: 'crew' as EmployeeRole,
    type: 'subcontractor' as const,
    status: 'active' as EmployeeStatus,
    hireDate: '2023-05-01',
    hourlyRate: 22,
    rating: 4.6,
    totalShifts: 89,
    preferredLocation: 'both' as const,
    certifications: [
      { id: 'cert-5', type: 'Water-Safety', name: 'Water Safety', expiryDate: '2024-04-01', status: 'valid' as CertificationStatus },
    ],
  },
  {
    id: 'emp-4',
    firstName: 'Amanda',
    lastName: 'Williams',
    email: 'amanda@healthshield.com',
    phone: '(512) 555-0104',
    photo: null,
    role: 'agent' as EmployeeRole,
    type: 'employee' as const,
    status: 'on-leave' as EmployeeStatus,
    hireDate: '2022-11-10',
    hourlyRate: 35,
    rating: 4.7,
    totalShifts: 156,
    preferredLocation: 'regional' as const,
    certifications: [
      { id: 'cert-6', type: 'USCG-OUPV', name: 'USCG OUPV License', expiryDate: '2025-09-20', status: 'valid' as CertificationStatus },
      { id: 'cert-7', type: 'CPR-FirstAid', name: 'CPR/First Aid', expiryDate: '2023-12-01', status: 'expired' as CertificationStatus },
    ],
  },
  {
    id: 'emp-5',
    firstName: 'Derek',
    lastName: 'Thompson',
    email: 'derek@healthshield.com',
    phone: '(512) 555-0105',
    photo: null,
    role: 'agent' as EmployeeRole,
    type: 'subcontractor' as const,
    status: 'training' as EmployeeStatus,
    hireDate: '2024-01-08',
    hourlyRate: 30,
    rating: null,
    totalShifts: 12,
    preferredLocation: 'regional' as const,
    certifications: [
      { id: 'cert-8', type: 'USCG-OUPV', name: 'USCG OUPV License', expiryDate: '2028-01-05', status: 'valid' as CertificationStatus },
    ],
  },
];

const roleConfig: Record<EmployeeRole, { label: string; color: string }> = {
  agent: { label: 'Agent', color: 'bg-blue-500' },
  crew: { label: 'Crew', color: 'bg-green-500' },
  admin: { label: 'Admin', color: 'bg-purple-500' },
  manager: { label: 'Manager', color: 'bg-orange-500' },
  dispatcher: { label: 'Dispatcher', color: 'bg-cyan-500' },
};

const statusConfig: Record<EmployeeStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  'on-leave': { label: 'On Leave', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  training: { label: 'Training', color: 'text-blue-600 bg-blue-50', icon: Award },
  inactive: { label: 'Inactive', color: 'text-gray-600 bg-gray-50', icon: XCircle },
  terminated: { label: 'Terminated', color: 'text-red-600 bg-red-50', icon: XCircle },
};

const certStatusConfig: Record<CertificationStatus, { label: string; color: string }> = {
  valid: { label: 'Valid', color: 'bg-green-500' },
  'expiring-soon': { label: 'Expiring Soon', color: 'bg-yellow-500' },
  expired: { label: 'Expired', color: 'bg-red-500' },
  pending: { label: 'Pending', color: 'bg-gray-500' },
};

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'agent', hourlyRate: '' });
  const [creating, setCreating] = useState(false);

  // Filter employees
  const filteredEmployees = demoEmployees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: demoEmployees.length,
    active: demoEmployees.filter(e => e.status === 'active').length,
    agents: demoEmployees.filter(e => e.role === 'agent').length,
    expiringCerts: demoEmployees.reduce(
      (acc, e) => acc + e.certifications.filter(c => c.status === 'expiring-soon' || c.status === 'expired').length,
      0
    ),
    avgRating: demoEmployees.filter(e => e.rating).reduce((acc, e) => acc + (e.rating || 0), 0) /
      demoEmployees.filter(e => e.rating).length,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const handleCreateEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.email) { toast.error('Name and email required'); return; }
    setCreating(true);
    try {
      await teamApi.invite({ email: newEmployee.email, firstName: newEmployee.firstName, lastName: newEmployee.lastName, role: newEmployee.role || 'agent' });
      toast.success('Employee invited successfully');
      setShowAddDialog(false);
      setNewEmployee({ firstName: '', lastName: '', email: '', phone: '', role: 'agent', hourlyRate: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to invite employee';
      toast.error(message);
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-6 w-6 text-blue-600" />
            Employee Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your agents, representatives, and staff licensing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the employee details to add them to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@healthshield.com" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(512) 555-0100" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newEmployee.role} onValueChange={val => setNewEmployee({...newEmployee, role: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="crew">Crew</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input id="hourlyRate" type="number" placeholder="35" value={newEmployee.hourlyRate} onChange={e => setNewEmployee({...newEmployee, hourlyRate: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEmployee} disabled={creating}>
                  {creating ? 'Adding...' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.agents} agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Ready to work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Customer feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cert Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              stats.expiringCerts > 0 ? "text-yellow-600" : "text-green-600"
            )}>
              {stats.expiringCerts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.expiringCerts > 0 ? 'Need attention' : 'All current'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agents
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.agents}</div>
            <p className="text-xs text-muted-foreground">Licensed operators</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="crew">Crew</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => {
              const roleInfo = roleConfig[employee.role];
              const statusInfo = statusConfig[employee.status];
              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.photo || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-white', roleInfo.color)}>
                      {roleInfo.label}
                    </Badge>
                    {employee.type === 'subcontractor' && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        Contract
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', statusInfo.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{employee.rating}</span>
                        <span className="text-muted-foreground text-sm">
                          ({employee.totalShifts} shifts)
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">New</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {employee.certifications.map((cert) => {
                        const certStatus = certStatusConfig[cert.status];
                        return (
                          <Badge
                            key={cert.id}
                            variant="outline"
                            className={cn(
                              'text-xs',
                              cert.status === 'expired' && 'border-red-300 text-red-600',
                              cert.status === 'expiring-soon' && 'border-yellow-300 text-yellow-600'
                            )}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {cert.type.replace('-', ' ')}
                            {cert.status !== 'valid' && (
                              <AlertTriangle className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {employee.preferredLocation === 'both'
                        ? 'All Regions'
                        : employee.preferredLocation === 'regional'
                        ? 'Regional Office'
                        : 'Main Office'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Certifications</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No employees found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
