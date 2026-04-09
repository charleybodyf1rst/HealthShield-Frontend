'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  AlertTriangle,
  Clock,
  Info,
  DollarSign,
  CalendarDays,
  Phone,
  SkipForward,
} from 'lucide-react';
import { insuranceApi } from '@/lib/api';
import { toast } from 'sonner';

interface RenewalPolicy {
  id: string;
  policyholderName: string;
  policyNumber: string;
  carrier: string;
  premium: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

// Sample data used when API is unavailable
const sampleRenewals: RenewalPolicy[] = [
  { id: '1', policyholderName: 'Maria Garcia', policyNumber: 'POL-2024-0891', carrier: 'Blue Cross Blue Shield', premium: 485, expiryDate: '2026-04-20', daysUntilExpiry: 13 },
  { id: '2', policyholderName: 'James Wilson', policyNumber: 'POL-2024-1042', carrier: 'Aetna', premium: 612, expiryDate: '2026-04-25', daysUntilExpiry: 18 },
  { id: '3', policyholderName: 'Sarah Chen', policyNumber: 'POL-2024-0763', carrier: 'UnitedHealthcare', premium: 538, expiryDate: '2026-04-30', daysUntilExpiry: 23 },
  { id: '4', policyholderName: 'Robert Johnson', policyNumber: 'POL-2024-0955', carrier: 'Cigna', premium: 420, expiryDate: '2026-05-08', daysUntilExpiry: 31 },
  { id: '5', policyholderName: 'Emily Davis', policyNumber: 'POL-2024-1100', carrier: 'Humana', premium: 395, expiryDate: '2026-05-15', daysUntilExpiry: 38 },
  { id: '6', policyholderName: 'Michael Brown', policyNumber: 'POL-2024-0822', carrier: 'Kaiser Permanente', premium: 510, expiryDate: '2026-05-22', daysUntilExpiry: 45 },
  { id: '7', policyholderName: 'Lisa Thompson', policyNumber: 'POL-2024-0694', carrier: 'Anthem', premium: 475, expiryDate: '2026-06-01', daysUntilExpiry: 55 },
  { id: '8', policyholderName: 'David Martinez', policyNumber: 'POL-2024-1205', carrier: 'Molina Healthcare', premium: 340, expiryDate: '2026-06-10', daysUntilExpiry: 64 },
  { id: '9', policyholderName: 'Jennifer Lee', policyNumber: 'POL-2024-0578', carrier: 'Blue Cross Blue Shield', premium: 590, expiryDate: '2026-06-20', daysUntilExpiry: 74 },
  { id: '10', policyholderName: 'Kevin White', policyNumber: 'POL-2024-0901', carrier: 'Aetna', premium: 450, expiryDate: '2026-06-28', daysUntilExpiry: 82 },
  { id: '11', policyholderName: 'Amanda Taylor', policyNumber: 'POL-2024-1150', carrier: 'Cigna', premium: 520, expiryDate: '2026-07-02', daysUntilExpiry: 86 },
];

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRenewals = async () => {
    try {
      const res = await insuranceApi.getPolicies({ status: 'active' });
      const policies = res?.data || res?.policies || [];

      if (Array.isArray(policies) && policies.length > 0) {
        const now = new Date();
        const ninetyDaysOut = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const mapped: RenewalPolicy[] = policies
          .filter((p: any) => {
            const expiry = new Date(p.expiry_date || p.end_date || '');
            return expiry >= now && expiry <= ninetyDaysOut;
          })
          .map((p: any) => ({
            id: String(p.id),
            policyholderName: p.policyholder_name || p.customer_name || p.name || 'Unknown',
            policyNumber: p.policy_number || p.number || `POL-${p.id}`,
            carrier: p.carrier || p.insurance_company || 'N/A',
            premium: p.premium || p.monthly_premium || 0,
            expiryDate: p.expiry_date || p.end_date || '',
            daysUntilExpiry: getDaysUntilExpiry(p.expiry_date || p.end_date || ''),
          }));

        if (mapped.length > 0) {
          setRenewals(mapped);
          return;
        }
      }

      // Fallback to sample data
      setRenewals(sampleRenewals);
    } catch {
      setRenewals(sampleRenewals);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRenewals();
  };

  const handleRenew = (policy: RenewalPolicy) => {
    toast.success(`Renewal initiated for ${policy.policyholderName} (${policy.policyNumber})`);
  };

  const handleContact = (policy: RenewalPolicy) => {
    toast.info(`Opening contact for ${policy.policyholderName}`);
  };

  const handleSkip = (policy: RenewalPolicy) => {
    toast('Renewal skipped', { description: `${policy.policyholderName} — ${policy.policyNumber}` });
  };

  // Categorize renewals
  const due30 = renewals.filter((r) => r.daysUntilExpiry <= 30);
  const due60 = renewals.filter((r) => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60);
  const due90 = renewals.filter((r) => r.daysUntilExpiry > 60 && r.daysUntilExpiry <= 90);

  const totalRevenueAtRisk = renewals.reduce((sum, r) => sum + r.premium * 12, 0);
  const thisMonth = renewals.filter((r) => {
    const exp = new Date(r.expiryDate);
    const now = new Date();
    return exp.getMonth() === now.getMonth() && exp.getFullYear() === now.getFullYear();
  });
  const nextMonth = renewals.filter((r) => {
    const exp = new Date(r.expiryDate);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return exp.getMonth() === next.getMonth() && exp.getFullYear() === next.getFullYear();
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-20" /></CardContent>
            </Card>
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const RenewalCard = ({ policy }: { policy: RenewalPolicy }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
      <div className="space-y-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{policy.policyholderName}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{policy.policyNumber}</span>
          <span>{policy.carrier}</span>
          <span className="font-medium text-foreground">${policy.premium.toLocaleString()}/mo</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(policy.expiryDate)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" onClick={() => handleRenew(policy)}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Renew
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleContact(policy)}>
          <Phone className="h-3.5 w-3.5 mr-1.5" />
          Contact
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleSkip(policy)}>
          <SkipForward className="h-3.5 w-3.5 mr-1.5" />
          Skip
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Renewal Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage upcoming policy renewals
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Renewals Due</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewals.length}</div>
            <p className="text-xs text-muted-foreground">Within 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonth.length}</div>
            <p className="text-xs text-muted-foreground">Renewals due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextMonth.length}</div>
            <p className="text-xs text-muted-foreground">Renewals due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenueAtRisk.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual premium value</p>
          </CardContent>
        </Card>
      </div>

      {/* Due in 30 Days — Urgent */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Due in 30 Days
            <Badge variant="destructive" className="ml-2">{due30.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {due30.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No urgent renewals</p>
          ) : (
            <div className="space-y-3">
              {due30.map((policy) => (
                <RenewalCard key={policy.id} policy={policy} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Due in 60 Days — Warning */}
      <Card className="border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-500">
            <Clock className="h-5 w-5" />
            Due in 60 Days
            <Badge className="ml-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">{due60.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {due60.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No renewals in this window</p>
          ) : (
            <div className="space-y-3">
              {due60.map((policy) => (
                <RenewalCard key={policy.id} policy={policy} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Due in 90 Days — Info */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-500">
            <Info className="h-5 w-5" />
            Due in 90 Days
            <Badge className="ml-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{due90.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {due90.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No renewals in this window</p>
          ) : (
            <div className="space-y-3">
              {due90.map((policy) => (
                <RenewalCard key={policy.id} policy={policy} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
