'use client';

import { Building2, MapPin, Clock, Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile, location, and business hours.
        </p>
      </div>

      <Separator />

      {/* Company Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic details about your organization.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                defaultValue="HealthShield"
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                defaultValue="https://healthshieldrentals.com"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-2xl font-bold text-blue-900">
                BB
              </div>
              <Button variant="outline" size="sm">
                Upload New Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                Your primary business location.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address-line1">Street Address</Label>
            <Input
              id="address-line1"
              defaultValue="2215 E Cesar Chavez St"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="Austin" placeholder="City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" defaultValue="TX" placeholder="State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" defaultValue="78702" placeholder="ZIP" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone & Business Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Timezone & Business Hours</CardTitle>
              <CardDescription>
                Set your operating timezone and daily hours.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                defaultValue="America/Chicago (CST)"
                placeholder="Select timezone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">Locale</Label>
              <Input
                id="locale"
                defaultValue="en-US"
                placeholder="Select locale"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours-open">Opening Time</Label>
              <Input id="hours-open" type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-close">Closing Time</Label>
              <Input id="hours-close" type="time" defaultValue="18:00" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
