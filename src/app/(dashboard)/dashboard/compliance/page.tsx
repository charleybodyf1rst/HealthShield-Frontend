'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Lock,
  KeyRound,
  Users,
  FileText,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

// Compliance score
const complianceScore = 92;

interface ChecklistItem {
  label: string;
  status: 'pass' | 'warning';
  detail?: string;
}

interface ChecklistSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ChecklistItem[];
}

const checklistSections: ChecklistSection[] = [
  {
    title: 'Data Encryption',
    icon: Lock,
    items: [
      { label: 'At-rest encryption (AES-256)', status: 'pass' },
      { label: 'In-transit TLS 1.3', status: 'pass' },
      { label: 'Key rotation (90-day cycle)', status: 'pass' },
    ],
  },
  {
    title: 'Access Controls',
    icon: KeyRound,
    items: [
      { label: 'Role-based access control (RBAC)', status: 'pass' },
      { label: 'Multi-factor authentication enabled', status: 'pass' },
      { label: 'Password policy review', status: 'warning', detail: 'Due for quarterly review — last updated 95 days ago' },
    ],
  },
  {
    title: 'Audit Trail',
    icon: ClipboardList,
    items: [
      { label: 'All PHI access logged', status: 'pass' },
      { label: '90-day log retention', status: 'pass' },
      { label: 'Tamper-proof audit logs', status: 'pass' },
    ],
  },
  {
    title: 'Business Associate Agreements',
    icon: FileText,
    items: [
      { label: 'ElevenLabs BAA signed', status: 'pass' },
      { label: 'Twilio BAA signed', status: 'pass' },
      { label: 'SendGrid BAA pending', status: 'warning', detail: 'BAA sent for signature — follow up required' },
    ],
  },
  {
    title: 'Training',
    icon: GraduationCap,
    items: [
      { label: 'Annual HIPAA training completed', status: 'pass' },
      { label: 'New hire training', status: 'warning', detail: '2 new hires due for onboarding training by Apr 30' },
    ],
  },
];

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
}

const sampleAuditLog: AuditLogEntry[] = [
  { id: '1', timestamp: '2026-04-07 14:32:18', user: 'sarah.mitchell@healthshield.com', action: 'VIEW', resource: 'Patient Record #4821', ipAddress: '192.168.1.45' },
  { id: '2', timestamp: '2026-04-07 14:28:05', user: 'james.rodriguez@healthshield.com', action: 'EXPORT', resource: 'Commission Report Q1', ipAddress: '10.0.0.12' },
  { id: '3', timestamp: '2026-04-07 13:55:42', user: 'admin@healthshield.com', action: 'UPDATE', resource: 'User Role: emily.watson', ipAddress: '10.0.0.1' },
  { id: '4', timestamp: '2026-04-07 13:41:19', user: 'emily.watson@healthshield.com', action: 'CREATE', resource: 'Policy POL-2026-1205', ipAddress: '192.168.1.88' },
  { id: '5', timestamp: '2026-04-07 12:15:33', user: 'michael.park@healthshield.com', action: 'VIEW', resource: 'Enrollment #3392', ipAddress: '192.168.1.67' },
  { id: '6', timestamp: '2026-04-07 11:50:07', user: 'laura.kim@healthshield.com', action: 'DELETE', resource: 'Draft Proposal #89', ipAddress: '10.0.0.34' },
  { id: '7', timestamp: '2026-04-07 11:22:51', user: 'admin@healthshield.com', action: 'UPDATE', resource: 'MFA Policy Settings', ipAddress: '10.0.0.1' },
  { id: '8', timestamp: '2026-04-07 10:48:14', user: 'sarah.mitchell@healthshield.com', action: 'VIEW', resource: 'Patient Record #5110', ipAddress: '192.168.1.45' },
  { id: '9', timestamp: '2026-04-07 09:30:00', user: 'system', action: 'ROTATE', resource: 'Encryption Keys (scheduled)', ipAddress: '10.0.0.1' },
  { id: '10', timestamp: '2026-04-07 08:00:00', user: 'system', action: 'SCAN', resource: 'Vulnerability Scan — 0 findings', ipAddress: '10.0.0.1' },
];

const actionColors: Record<string, string> = {
  VIEW: 'bg-blue-500/10 text-blue-600',
  CREATE: 'bg-green-500/10 text-green-600',
  UPDATE: 'bg-yellow-500/10 text-yellow-600',
  DELETE: 'bg-red-500/10 text-red-600',
  EXPORT: 'bg-purple-500/10 text-purple-600',
  ROTATE: 'bg-cyan-500/10 text-cyan-600',
  SCAN: 'bg-emerald-500/10 text-emerald-600',
};

export default function CompliancePage() {
  const [auditLog] = useState<AuditLogEntry[]>(sampleAuditLog);

  const totalChecks = checklistSections.reduce((sum, s) => sum + s.items.length, 0);
  const passedChecks = checklistSections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.status === 'pass').length,
    0,
  );
  const warningChecks = totalChecks - passedChecks;

  const scoreColor =
    complianceScore >= 90
      ? 'text-green-500'
      : complianceScore >= 70
        ? 'text-yellow-500'
        : 'text-red-500';

  const scoreBorderColor =
    complianceScore >= 90
      ? 'border-green-500/30'
      : complianceScore >= 70
        ? 'border-yellow-500/30'
        : 'border-red-500/30';

  const handleExportAuditLog = () => {
    toast.success('Audit log exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            HIPAA Compliance
          </h1>
          <p className="text-muted-foreground">
            Monitor compliance posture, audit trails, and regulatory requirements
          </p>
        </div>
      </div>

      {/* Score + Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`${scoreBorderColor} md:row-span-2`}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className={`text-7xl font-bold ${scoreColor}`}>{complianceScore}%</div>
            <p className="text-sm text-muted-foreground mt-3">
              {complianceScore >= 90 ? 'Excellent — All critical controls met' : complianceScore >= 70 ? 'Good — Some items need attention' : 'Needs Improvement — Action required'}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">{passedChecks} passed</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">{warningChecks} warnings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Controls Passed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{passedChecks}/{totalChecks}</div>
            <p className="text-xs text-muted-foreground">Security controls active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Items Needing Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{warningChecks}</div>
            <p className="text-xs text-muted-foreground">Require follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Audit</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Apr 7</div>
            <p className="text-xs text-muted-foreground">Continuous monitoring active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">BAA Coverage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2/3</div>
            <p className="text-xs text-muted-foreground">Vendor agreements signed</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist Sections */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checklistSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      {item.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Recent Audit Log
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportAuditLog}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Audit Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {entry.timestamp}
                    </TableCell>
                    <TableCell className="text-sm">{entry.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={actionColors[entry.action] || ''}>
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.resource}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {entry.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
