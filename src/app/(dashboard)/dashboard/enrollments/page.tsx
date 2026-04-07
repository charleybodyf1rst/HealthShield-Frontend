'use client';

import { useEffect, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useInsuranceStore } from '@/stores/insurance-store';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  active: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
  expired: 'bg-gray-500/10 text-gray-500',
};

export default function EnrollmentsPage() {
  const { enrollments, isLoading, error, fetchEnrollments } = useInsuranceStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Fetch all enrollments (pass empty string for all programs)
    fetchEnrollments('');
  }, [fetchEnrollments]);

  const filteredEnrollments =
    statusFilter === 'all'
      ? enrollments
      : enrollments.filter((e) => e.status === statusFilter);

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
          <h1 className="text-2xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-muted-foreground">
            Track and manage program enrollments across all insurance plans.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Enrollments table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && enrollments.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No enrollments found</p>
              <p className="text-sm mt-1">
                {statusFilter !== 'all'
                  ? `No enrollments with status "${statusFilter}". Try a different filter.`
                  : 'Enrollments will appear here when leads are enrolled in programs.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.leadName || `Lead #${enrollment.leadId}`}
                    </TableCell>
                    <TableCell>
                      {enrollment.programName || `Program #${enrollment.programId}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[enrollment.status] || ''}
                      >
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(enrollment.startDate)}</TableCell>
                    <TableCell>${enrollment.premium.toLocaleString()}/mo</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/enrollments/${enrollment.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isLoading && enrollments.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
