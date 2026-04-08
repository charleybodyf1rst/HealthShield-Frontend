'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { AuthGuard } from '@/providers/auth-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="dark">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <DashboardHeader />
            <main
              className="flex-1 overflow-auto p-4 md:p-6 bg-background text-foreground"
            >
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
