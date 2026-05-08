'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaggedLeadsList } from '@/components/dashboard/tagged-leads-list';

export default function PersonalLeadsPage() {
  return (
    <TaggedLeadsList
      tag="personal"
      title={
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-400" />
          Personal Leads
        </h1>
      }
      subtitle="Leads you know personally — friends, ex-coworkers, anyone who'd actually take your call. Tag any lead with ★ Personal on its detail page to add it here."
      rightActions={
        <Button asChild size="sm">
          <Link href="/dashboard/leads/new?personal=1" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Personal Lead
          </Link>
        </Button>
      }
      avatarClass="bg-gradient-to-br from-pink-500 to-rose-500"
      emptyTitle="No personal leads yet"
      emptySubtitle="Click ★ Personal on any lead's detail page to add them, or use Add Personal Lead above."
    />
  );
}
