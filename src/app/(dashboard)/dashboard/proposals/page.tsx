'use client';

import { useEffect } from 'react';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, FileText, Loader2, Plus } from 'lucide-react';
import { useInsuranceStore } from '@/stores/insurance-store';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  sent: 'bg-blue-500/10 text-blue-600',
  accepted: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default function ProposalsPage() {
  const { proposals, isLoading, error, fetchProposals } = useInsuranceStore();

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">
            Create and manage insurance proposals for your leads.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal
          </Link>
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Proposals table */}
      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && proposals.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No proposals yet</p>
              <p className="text-sm mt-1">Create your first proposal to send to a lead.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/proposals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Proposal
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Total Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">
                      {proposal.leadName || `Lead #${proposal.leadId}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {proposal.programs.length} program{proposal.programs.length !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>${proposal.totalPremium.toLocaleString()}/mo</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[proposal.status] || ''}
                      >
                        {statusLabels[proposal.status] || proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/proposals/${proposal.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isLoading && proposals.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
