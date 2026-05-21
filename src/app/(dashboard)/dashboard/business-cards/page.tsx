'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  CreditCard,
  Plus,
  Download,
  Pencil,
  Trash2,
  RotateCcw,
  ImageOff,
  Mail,
  Phone,
} from 'lucide-react';
import {
  businessCardsApi,
  type BusinessCard as BusinessCardType,
  type CreateBusinessCardData,
} from '@/lib/api';

interface FormState {
  name: string;
  role: string;
  email: string;
  phone: string;
}

const emptyForm: FormState = { name: '', role: '', email: '', phone: '' };

export default function BusinessCardsPage() {
  const [cards, setCards] = useState<BusinessCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessCardType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BusinessCardType | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await businessCardsApi.list({ per_page: '100' });
      setCards(res.data ?? []);
    } catch (err) {
      console.error('Failed to load business cards', err);
      toast.error('Failed to load business cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (card: BusinessCardType) => {
    setEditing(card);
    setForm({
      name: card.name,
      role: card.role,
      email: card.email ?? '',
      phone: card.phone ?? '',
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateBusinessCardData = {
        name: form.name.trim(),
        role: form.role.trim().toUpperCase(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };
      if (editing) {
        const updated = await businessCardsApi.update(editing.id, payload);
        setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Card updated');
      } else {
        const created = await businessCardsApi.create(payload);
        setCards((prev) => [...prev, created]);
        toast.success(
          'Card saved. Run `python cards/generate_cards.py` locally to render print PDF + previews.'
        );
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save card');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await businessCardsApi.delete(deleteTarget.id);
      setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success('Card deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete card');
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleFlip = (id: number) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Business Cards</h1>
            <p className="text-sm text-muted-foreground">
              Team-member print cards. Front shows contact info, back shows BodyF1RST + HealthShield benefits with a QR to bodyf1rst.com.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business Card
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-[3.75/2.25] w-full" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No business cards yet.</p>
            <Button onClick={openCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create your first card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const isFlipped = flipped[card.id];
            const imgPath = isFlipped ? card.back_png_path : card.front_png_path;
            return (
              <Card key={card.id} className="overflow-hidden">
                <div
                  className="relative aspect-[3.75/2.25] cursor-pointer bg-muted"
                  onClick={() => toggleFlip(card.id)}
                  title="Click to flip"
                >
                  {imgPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgPath}
                      alt={`${card.name} business card ${isFlipped ? 'back' : 'front'}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                      <span className="text-xs">Run generate_cards.py to render</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="absolute right-2 top-2">
                    {isFlipped ? 'Back' : 'Front'}
                  </Badge>
                </div>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold">{card.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {card.role}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    {card.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${card.email}`} className="truncate hover:text-foreground">
                          {card.email}
                        </a>
                      </div>
                    )}
                    {card.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <a href={`tel:${card.phone}`} className="hover:text-foreground">
                          {card.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFlip(card.id)}
                    >
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />
                      Flip
                    </Button>
                    {card.pdf_path && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={card.pdf_path} download>
                          <Download className="mr-1 h-3.5 w-3.5" />
                          PDF
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(card)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(card)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Business Card' : 'Add Business Card'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the card details. Asset files are not regenerated automatically.'
                : 'Add a new team member. After saving, run `python cards/generate_cards.py` to render the print PDF and PNG previews.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bc-name">Name</Label>
              <Input
                id="bc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jonathan Bushell"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bc-role">Role / Title</Label>
              <Input
                id="bc-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. CTO"
              />
              <p className="text-xs text-muted-foreground">Rendered in uppercase on the card.</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bc-email">Email</Label>
              <Input
                id="bc-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. jonathan@systemsf1rst.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bc-phone">Phone</Label>
              <Input
                id="bc-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 760-299-3577"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this business card?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes the database record for {deleteTarget?.name}. Print assets in
              <code className="mx-1 rounded bg-muted px-1">public/cards/</code>
              are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
