'use client';

import { Users, UserPlus, MoreHorizontal, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const teamMembers = [
  {
    name: 'Charley Williams',
    email: 'charley@healthshieldrentals.com',
    role: 'Owner',
    initials: 'CW',
    status: 'Active',
  },
  {
    name: 'Jake Torres',
    email: 'jake@healthshieldrentals.com',
    role: 'Captain',
    initials: 'JT',
    status: 'Active',
  },
  {
    name: 'Maria Santos',
    email: 'maria@healthshieldrentals.com',
    role: 'Captain',
    initials: 'MS',
    status: 'Active',
  },
  {
    name: 'Dylan Reed',
    email: 'dylan@healthshieldrentals.com',
    role: 'Sales',
    initials: 'DR',
    status: 'Invited',
  },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'Owner':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'Captain':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Sales':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    default:
      return '';
  }
};

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and permissions.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Separator />

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Roles Defined</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                People with access to this workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={roleBadgeVariant(member.role)}
                  >
                    {member.role}
                  </Badge>
                  {member.status === 'Invited' && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
