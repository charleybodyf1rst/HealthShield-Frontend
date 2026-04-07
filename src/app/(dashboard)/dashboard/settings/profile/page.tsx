'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowLeft, Mail, Phone, Loader2 } from 'lucide-react';
import { useUser, useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
}

export default function ProfilePage() {
  const user = useUser();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: '',
      department: '',
    },
  });

  // Populate form with current user data on mount / user change
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: (user as any).phone ?? '',
        title: (user as any).title ?? '',
        department: (user as any).department ?? '',
      });
    }
  }, [user, reset]);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
    : '??';

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await api.patch('/api/v1/crm/profile', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        department: data.department,
      });

      // Update local auth store so UI reflects changes immediately
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });

      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message =
        error?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
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
      <form onSubmit={handleSubmit(onSubmit)}>
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
                  {...register('firstName', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: true })}
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
                {...register('email', { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="No phone number on file"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g. Sales Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="e.g. Insurance Sales"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
