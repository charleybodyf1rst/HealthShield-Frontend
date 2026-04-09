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
import { Loader2, Plus, Eye, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { useInsuranceStore } from '@/stores/insurance-store';
import { toast } from 'sonner';

const typeLabels: Record<string, string> = {
  individual: 'Individual',
  family: 'Family',
  medicare_advantage: 'Medicare Advantage',
  medicare_supplement: 'Medicare Supplement',
  group: 'Group',
  dental_vision: 'Dental & Vision',
  short_term: 'Short Term',
  life: 'Life',
};

export default function ProgramsPage() {
  const { programs, isLoading, error, fetchPrograms } = useInsuranceStore();

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insurance Programs</h1>
          <p className="text-muted-foreground">
            Manage your insurance programs and coverage plans.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Link>
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Programs table */}
      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && programs.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No programs yet</p>
              <p className="text-sm mt-1">Create your first insurance program to get started.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/programs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Program
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Deductible</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.employer_name || program.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {typeLabels[program.program_tier || program.type] || program.program_tier || program.type || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(program.monthly_pepm || program.premium || 0).toLocaleString()}/mo</TableCell>
                    <TableCell>${Number(program.deductible_option || program.deductible || 0).toLocaleString()}</TableCell>
                    <TableCell>{program.enrolled_employees ?? program.enrollmentCount ?? 0} / {program.total_employees ?? '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          (program.status === 'active' || program.isActive)
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-gray-500/10 text-gray-500'
                        }
                      >
                        {(program.status === 'active' || program.isActive) ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toast.info('Detail view coming soon')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast.info('Detail view coming soon')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isLoading && programs.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
