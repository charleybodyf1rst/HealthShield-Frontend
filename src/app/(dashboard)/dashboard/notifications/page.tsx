'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  DollarSign,
  Calendar,
  Settings,
} from 'lucide-react';

type NotificationType = 'all' | 'leads' | 'communications' | 'insurance' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ElementType;
  iconColor: string;
  actionUrl?: string;
}

// Placeholder notifications — will be replaced with API data
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'leads',
    title: 'New Lead Assigned',
    message: 'Michele Freeman from Austin Childrens Museum has been assigned to you.',
    timestamp: '2 minutes ago',
    read: false,
    icon: UserPlus,
    iconColor: 'text-blue-400',
    actionUrl: '/dashboard/leads',
  },
  {
    id: '2',
    type: 'communications',
    title: 'Missed Call',
    message: 'Incoming call from (512) 555-0142 — no voicemail left.',
    timestamp: '15 minutes ago',
    read: false,
    icon: Phone,
    iconColor: 'text-red-400',
  },
  {
    id: '3',
    type: 'insurance',
    title: 'Enrollment Completed',
    message: 'Acme Corp (50 employees) has completed their Gold tier enrollment.',
    timestamp: '1 hour ago',
    read: false,
    icon: ShieldCheck,
    iconColor: 'text-green-400',
    actionUrl: '/dashboard/enrollments',
  },
  {
    id: '4',
    type: 'communications',
    title: 'New SMS Received',
    message: '"Hi, I wanted to follow up on the proposal you sent last week..."',
    timestamp: '2 hours ago',
    read: true,
    icon: MessageSquare,
    iconColor: 'text-purple-400',
    actionUrl: '/dashboard/messages',
  },
  {
    id: '5',
    type: 'insurance',
    title: 'Commission Payout',
    message: 'Commission of $1,250.00 processed for Q1 renewals.',
    timestamp: '5 hours ago',
    read: true,
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    actionUrl: '/dashboard/commissions',
  },
  {
    id: '6',
    type: 'leads',
    title: 'Follow-Up Reminder',
    message: 'Scheduled follow-up with Johnson & Associates is in 30 minutes.',
    timestamp: '6 hours ago',
    read: true,
    icon: Calendar,
    iconColor: 'text-orange-400',
    actionUrl: '/dashboard/calendar',
  },
  {
    id: '7',
    type: 'system',
    title: 'SMS Registration Update',
    message: 'Your A2P 10DLC campaign is still under review. No action needed.',
    timestamp: '1 day ago',
    read: true,
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  {
    id: '8',
    type: 'communications',
    title: 'Email Delivered',
    message: 'Proposal email to "Texas Construction Group" was delivered successfully.',
    timestamp: '1 day ago',
    read: true,
    icon: Mail,
    iconColor: 'text-sky-400',
    actionUrl: '/dashboard/emails',
  },
];

const FILTER_TABS: { id: NotificationType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'leads', label: 'Leads' },
  { id: 'communications', label: 'Comms' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationType>('all');

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8 text-orange-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay on top of leads, communications, and policy updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1.5" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                You{"'"}re all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-orange-500/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex-shrink-0 h-9 w-9 rounded-full bg-muted flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${notification.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>

                    {/* Action */}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
