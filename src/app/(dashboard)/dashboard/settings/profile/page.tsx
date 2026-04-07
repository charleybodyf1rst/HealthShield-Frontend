'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useUser } from '@/stores/auth-store';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const user = useUser();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
    : '??';

  const handleSave = () => {
    toast.info('Profile editing coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your profile information
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">
              {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role?.replace('_', ' ') ?? 'Unknown role'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={user?.firstName ?? ''}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={user?.lastName ?? ''}
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </Label>
            <Input
              id="phone"
              value={user?.phone ?? ''}
              readOnly
              placeholder="No phone number on file"
              className="bg-muted/50"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
