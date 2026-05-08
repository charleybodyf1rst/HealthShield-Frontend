'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  Calendar,
  CheckSquare,
  ChevronDown,
  Bell,
  ClipboardList,
  Database,
  DollarSign,
  FileText,
  FolderOpen,
  GitBranch,
  Sparkles,
  Heart,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  StickyNote,
  Clock,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore, useUser } from '@/stores/auth-store';
import { useInboxStore } from '@/stores/communications-store';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    href: '/dashboard/leads',
    icon: UserPlus,
  },
  {
    title: 'Pipeline',
    href: '/dashboard/pipeline',
    icon: GitBranch,
  },
  {
    title: 'Primed Pipeline',
    href: '/dashboard/primed-pipeline',
    icon: Sparkles,
  },
  {
    title: 'Personal Pipeline',
    href: '/dashboard/personal-pipeline',
    icon: Heart,
  },
  {
    title: 'Policyholders',
    href: '/dashboard/contacts',
    icon: Users,
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  },
];

const insuranceItems = [
  {
    title: 'Programs',
    href: '/dashboard/programs',
    icon: ShieldCheck,
  },
  {
    title: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: ClipboardList,
  },
  {
    title: 'Proposals',
    href: '/dashboard/proposals',
    icon: FileText,
  },
  {
    title: 'Policies',
    href: '/dashboard/policies',
    icon: Shield,
  },
  {
    title: 'Claims',
    href: '/dashboard/claims',
    icon: FileText,
  },
  {
    title: 'Renewals',
    href: '/dashboard/renewals',
    icon: RefreshCw,
  },
  {
    title: 'Commissions',
    href: '/dashboard/commissions',
    icon: DollarSign,
  },
  {
    title: 'Wellness',
    href: '/dashboard/wellness',
    icon: Heart,
  },
];

// Communication items - badge will be added dynamically
const baseCommunicationItems = [
  {
    title: 'Inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
    badgeKey: 'unread', // Special key for dynamic badge
  },
  {
    title: 'Emails',
    href: '/dashboard/emails',
    icon: Mail,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Megaphone,
  },
  {
    title: 'Email Templates',
    href: '/dashboard/email-templates',
    icon: FileText,
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FolderOpen,
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
];

const aiItems = [
  {
    title: 'AI Assistant',
    href: '/dashboard/ai-agents',
    icon: Bot,
  },
  {
    title: 'AI Caller',
    href: '/dashboard/ai-caller',
    icon: Phone,
  },
  {
    title: 'Call History',
    href: '/dashboard/ai-caller/history',
    icon: Clock,
  },
  {
    title: 'AI Notes',
    href: '/dashboard/ai-notes',
    icon: StickyNote,
  },
  {
    title: 'Data Enrichment',
    href: '/dashboard/enrichment',
    icon: Database,
  },
];

const reportItems = [
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
];

const adminItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Compliance',
    href: '/dashboard/compliance',
    icon: ShieldCheck,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useUser();
  const logout = useAuthStore((state) => state.logout);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Inbox unread count
  const { unreadCount, fetchUnreadCount } = useInboxStore();

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Build communication items with dynamic badge
  const communicationItems = baseCommunicationItems.map((item) => ({
    ...item,
    badge: item.badgeKey === 'unread' && unreadCount > 0
      ? unreadCount > 99 ? '99+' : String(unreadCount)
      : undefined,
  }));

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeKey?: string;
  }) => {
    const active = isActive(item.href);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground animate-pulse">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2 px-2 py-1.5',
                isCollapsed && 'justify-center'
              )}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/25">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg tracking-tight">
                  <span className="text-foreground">Health</span>
                  <span className="text-foreground">Shield</span>
                </span>
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insurance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insuranceItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-1 flex-col text-left text-sm">
                      <span className="font-medium truncate">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && (
                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 z-[100]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
