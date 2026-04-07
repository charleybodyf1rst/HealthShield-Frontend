'use client';

import { Phone, Mail, CreditCard, CalendarDays, Plug } from 'lucide-react';
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

const integrations = [
  {
    name: 'Twilio',
    description: 'SMS notifications, AI voice calls, and phone number management.',
    icon: Phone,
    connected: true,
    account: '+1 (512) 555-0199',
  },
  {
    name: 'SendGrid',
    description: 'Transactional emails, campaigns, and email template delivery.',
    icon: Mail,
    connected: true,
    account: 'bookings@healthshieldrentals.com',
  },
  {
    name: 'Stripe',
    description: 'Payment processing, subscriptions, and invoice management.',
    icon: CreditCard,
    connected: false,
    account: null,
  },
  {
    name: 'Google Calendar',
    description: 'Sync bookings and availability with Google Calendar.',
    icon: CalendarDays,
    connected: false,
    account: null,
  },
];

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect third-party services to extend your platform capabilities.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <integration.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                  </div>
                </div>
                <Badge
                  variant={integration.connected ? 'default' : 'secondary'}
                  className={
                    integration.connected
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : ''
                  }
                >
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>{integration.description}</CardDescription>
              {integration.connected && integration.account && (
                <p className="text-sm font-medium text-muted-foreground">
                  Account: {integration.account}
                </p>
              )}
              <Button
                variant={integration.connected ? 'outline' : 'default'}
                size="sm"
                className="w-full"
              >
                <Plug className="mr-2 h-4 w-4" />
                {integration.connected ? 'Configure' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
