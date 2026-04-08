'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsSettingsPage() {
  const [emailSettings, setEmailSettings] = useState<NotificationSetting[]>([
    {
      id: 'email-enrollments',
      label: 'Enrollment Confirmations',
      description: 'Receive email notifications for new enrollments and policy updates.',
      enabled: true,
    },
    {
      id: 'email-leads',
      label: 'New Lead Alerts',
      description: 'Get notified when a new lead is captured.',
      enabled: true,
    },
    {
      id: 'email-reports',
      label: 'Weekly Reports',
      description: 'Receive weekly summary reports via email.',
      enabled: false,
    },
    {
      id: 'email-marketing',
      label: 'Marketing Updates',
      description: 'Platform news, feature releases, and tips.',
      enabled: false,
    },
  ]);

  const [smsSettings, setSmsSettings] = useState<NotificationSetting[]>([
    {
      id: 'sms-enrollments',
      label: 'Enrollment Alerts',
      description: 'SMS alerts for same-day enrollments and cancellations.',
      enabled: true,
    },
    {
      id: 'sms-reminders',
      label: 'Shift Reminders',
      description: 'Receive SMS reminders before your scheduled shifts.',
      enabled: true,
    },
  ]);

  const [pushSettings, setPushSettings] = useState<NotificationSetting[]>([
    {
      id: 'push-messages',
      label: 'New Messages',
      description: 'Push notifications for incoming messages.',
      enabled: true,
    },
    {
      id: 'push-tasks',
      label: 'Task Assignments',
      description: 'Get notified when a task is assigned to you.',
      enabled: true,
    },
    {
      id: 'push-ai',
      label: 'AI Agent Updates',
      description: 'Notifications when AI agents complete actions.',
      enabled: false,
    },
  ]);

  const toggleSetting = (
    settings: NotificationSetting[],
    setter: React.Dispatch<React.SetStateAction<NotificationSetting[]>>,
    id: string
  ) => {
    setter(
      settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const renderSection = (
    title: string,
    description: string,
    icon: React.ElementType,
    settings: NotificationSetting[],
    setter: React.Dispatch<React.SetStateAction<NotificationSetting[]>>
  ) => {
    const Icon = icon;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label htmlFor={setting.id} className="text-sm font-medium">
                  {setting.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                onCheckedChange={() =>
                  toggleSetting(settings, setter, setting.id)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Choose how and when you want to be notified about activity.
        </p>
      </div>

      <Separator />

      {renderSection(
        'Email Notifications',
        'Control which emails you receive.',
        Mail,
        emailSettings,
        setEmailSettings
      )}

      {renderSection(
        'SMS Alerts',
        'Manage text message notifications.',
        MessageSquare,
        smsSettings,
        setSmsSettings
      )}

      {renderSection(
        'Push Notifications',
        'Configure browser and mobile push alerts.',
        Smartphone,
        pushSettings,
        setPushSettings
      )}
    </div>
  );
}
