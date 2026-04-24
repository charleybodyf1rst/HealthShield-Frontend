'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Shield,
  Users,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  MessageSquare,
  UserCheck,
  XCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Building2,
  Briefcase,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { cn } from '@/lib/utils';
import type { CrmLead, LeadStatus } from '@/types/crm';
import { InteractionTimeline } from './InteractionTimeline';

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-cyan-100 text-cyan-700',
  quoted: 'bg-yellow-100 text-yellow-700',
  negotiating: 'bg-orange-100 text-orange-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  unresponsive: 'bg-gray-100 text-gray-700',
};

const planTypeIcons: Record<string, string> = {
  individual: 'Individual',
  family: 'Family',
  group: 'Group',
  corporate: 'Corporate',
  any: 'Any',
};

export function LeadsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const {
    leads,
    leadsLoading,
    leadPipeline,
    leadOptions,
    fetchLeads,
    fetchLeadPipeline,
    fetchLeadOptions,
    createLead,
    updateLead,
    convertLead,
    markLeadLost,
    error,
  } = useHealthShieldCrmStore();

  useEffect(() => {
    fetchLeads();
    fetchLeadPipeline();
    fetchLeadOptions();
  }, [fetchLeads, fetchLeadPipeline, fetchLeadOptions]);

  const sizeRanges: Record<string, { min?: number; max?: number }> = {
    all: {},
    '20-50': { min: 20, max: 50 },
    '50-100': { min: 50, max: 100 },
    '100-200': { min: 100, max: 200 },
    '200-400': { min: 200, max: 400 },
    '400-1000': { min: 400, max: 1000 },
    '1000-2000': { min: 1000, max: 2000 },
    '2000-5000': { min: 2000, max: 5000 },
    '5000+': { min: 5000 },
  };

  const handleSearch = () => {
    const range = sizeRanges[sizeFilter] || {};
    fetchLeads({
      search: searchTerm,
      status: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
      employees_min: range.min,
      employees_max: range.max,
    } as any);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchTerm ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleConvert = async () => {
    if (!selectedLead) return;
    try {
      await convertLead(selectedLead.id);
      setShowConvertDialog(false);
      setSelectedLead(null);
    } catch (err) {
      console.error('Failed to convert lead:', err);
    }
  };

  const handleMarkLost = async (reason: string) => {
    if (!selectedLead) return;
    try {
      await markLeadLost(selectedLead.id, reason);
      setSelectedLead(null);
    } catch (err) {
      console.error('Failed to mark lead as lost:', err);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{leadPipeline?.pipeline?.new || 0}</p>
            <p className="text-sm text-blue-600">New</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{leadPipeline?.pipeline?.contacted || 0}</p>
            <p className="text-sm text-purple-600">Contacted</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-700">{leadPipeline?.pipeline?.qualified || 0}</p>
            <p className="text-sm text-cyan-600">Qualified</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{leadPipeline?.pipeline?.quoted || 0}</p>
            <p className="text-sm text-yellow-600">Quoted</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{leadPipeline?.pipeline?.converted || 0}</p>
            <p className="text-sm text-green-600">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {leadPipeline?.needsFollowUp && leadPipeline.needsFollowUp > 0 && (
        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-orange-700 font-medium">
            {leadPipeline.needsFollowUp} lead{leadPipeline.needsFollowUp > 1 ? 's' : ''} need follow-up today
          </span>
          <Button variant="ghost" size="sm" className="ml-auto text-orange-700 hover:text-orange-800">
            View All
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search leads by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New Inquiry</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="quoted">Quote Sent</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="converted">Enrolled</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sizeFilter} onValueChange={(v) => { setSizeFilter(v); }}>
          <SelectTrigger className="w-40">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Company Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            <SelectItem value="20-50">20-50</SelectItem>
            <SelectItem value="50-100">50-100</SelectItem>
            <SelectItem value="100-200">100-200</SelectItem>
            <SelectItem value="200-400">200-400</SelectItem>
            <SelectItem value="400-1000">400-1,000</SelectItem>
            <SelectItem value="1000-2000">1,000-2,000</SelectItem>
            <SelectItem value="2000-5000">2,000-5,000</SelectItem>
            <SelectItem value="5000+">5,000+</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleSearch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>

        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <NewLeadForm
              options={leadOptions}
              onSubmit={async (data) => {
                await createLead(data);
                setShowNewLeadDialog(false);
              }}
              onCancel={() => setShowNewLeadDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-hidden flex gap-6">
        {/* Left Panel - Lead List */}
        <div className="flex-1 overflow-auto">
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Leads ({filteredLeads.length})</span>
                {leadPipeline?.todayLeads ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    +{leadPipeline.todayLeads} today
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leadsLoading ? (
                <div className="p-8 text-center text-slate-500">Loading leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No leads found. Create your first lead!
                </div>
              ) : (
                <div className="divide-y">
                  {filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onClick={() => setSelectedLead(lead)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Lead Detail */}
        {selectedLead && (
          <div className="w-full md:w-[450px] overflow-auto">
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onUpdate={(data) => updateLead(selectedLead.id, data)}
              onConvert={() => setShowConvertDialog(true)}
              onMarkLost={handleMarkLost}
            />
          </div>
        )}
      </div>

      {/* Convert Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Convert <strong>{selectedLead?.firstName} {selectedLead?.lastName}</strong> to a customer?
              This will create a new customer record with all the lead information.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700">
                <UserCheck className="w-4 h-4 mr-2" />
                Convert to Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Lead Row Component
function LeadRow({
  lead,
  isSelected,
  onClick,
}: {
  lead: CrmLead;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        'p-4 cursor-pointer hover:bg-slate-50 transition-colors',
        isSelected && 'bg-yellow-50 border-l-4 border-yellow-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900">
              {lead.firstName} {lead.lastName}
            </span>
            <Badge className={cn('text-xs', statusColors[lead.status])}>
              {lead.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </span>
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {lead.email}
              </span>
            )}
            {lead.companyName && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {lead.companyName}
              </span>
            )}
            {lead.estimatedEmployees && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {lead.estimatedEmployees.toLocaleString()} employees
              </span>
            )}
          </div>

          {lead.categoryInterested && (
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-slate-600">
                <Shield className="w-3 h-3" />
                {planTypeIcons[lead.categoryInterested] || 'Insurance'}{' '}
                {lead.categoryInterested.replace('_', ' ')}
              </span>
              {lead.partySize && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Users className="w-3 h-3" />
                  {lead.partySize} members
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}

// Lead Detail Panel Component
function LeadDetailPanel({
  lead,
  onClose,
  onUpdate,
  onConvert,
  onMarkLost,
}: {
  lead: CrmLead;
  onClose: () => void;
  onUpdate: (data: Partial<CrmLead>) => Promise<void>;
  onConvert: () => void;
  onMarkLost: (reason: string) => void;
}) {
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');

  const { fetchInteractionsForLead, interactions, interactionsLoading } = useHealthShieldCrmStore();

  useEffect(() => {
    fetchInteractionsForLead(lead.id);
  }, [lead.id, fetchInteractionsForLead]);

  return (
    <Card className="h-full">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-base">Lead Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-6 overflow-auto max-h-[calc(100vh-250px)]">
        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">
            {lead.firstName} {lead.lastName}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                {lead.phone}
              </a>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.contactPhoneAlt && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${lead.contactPhoneAlt}`} className="text-blue-600 hover:underline">
                  {lead.contactPhoneAlt}
                </a>
                <span className="text-xs text-slate-400">(alt)</span>
              </div>
            )}
          </div>
        </div>

        {/* Company & Department */}
        {(lead.companyName || lead.contactTitle || lead.industry) && (
          <div className="space-y-2 text-sm">
            {lead.companyName && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{lead.companyName}</span>
              </div>
            )}
            {lead.contactTitle && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{lead.contactTitle}</span>
              </div>
            )}
            {lead.industry && (
              <div className="text-slate-500 ml-6">{lead.industry}</div>
            )}
            {lead.estimatedEmployees && (
              <div className="flex items-center gap-2 ml-6">
                <Users className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600">{lead.estimatedEmployees.toLocaleString()} employees</span>
              </div>
            )}
            {lead.website && (
              <div className="ml-6">
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  {lead.website}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Business Address */}
        {(lead.companyAddress || lead.companyCity) && (
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                {lead.companyAddress && <p>{lead.companyAddress}</p>}
                <p>
                  {[lead.companyCity, lead.companyState].filter(Boolean).join(', ')}
                  {lead.companyZip ? ` ${lead.companyZip}` : ''}
                </p>
                {lead.companyCountry && lead.companyCountry !== 'US' && (
                  <p>{lead.companyCountry}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insurance Interest */}
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-700 text-sm">Insurance Interest</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.categoryInterested && (
              <div>
                <span className="text-slate-500">Plan Category:</span>
                <p className="font-medium">
                  {planTypeIcons[lead.categoryInterested] || ''}{' '}
                  {lead.categoryInterested.replace('_', ' ')}
                </p>
              </div>
            )}
            {lead.partySize && (
              <div>
                <span className="text-slate-500">Household Size:</span>
                <p className="font-medium">{lead.partySize} members</p>
              </div>
            )}
            {lead.occasion && (
              <div>
                <span className="text-slate-500">Reason:</span>
                <p className="font-medium capitalize">{lead.occasion.replace('_', ' ')}</p>
              </div>
            )}
            {lead.preferredDate && (
              <div>
                <span className="text-slate-500">Preferred Date:</span>
                <p className="font-medium">{new Date(lead.preferredDate).toLocaleDateString()}</p>
              </div>
            )}
            {(lead.budgetMin || lead.budgetMax) && (
              <div className="col-span-2">
                <span className="text-slate-500">Budget:</span>
                <p className="font-medium">
                  ${lead.budgetMin || 0} - ${lead.budgetMax || '?'}/mo
                </p>
              </div>
            )}
          </div>
          {lead.specialRequests && (
            <div>
              <span className="text-slate-500 text-sm">Special Requirements:</span>
              <p className="text-sm mt-1">{lead.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={cn('text-sm', statusColors[lead.status])}>
              {lead.status}
            </Badge>
            <span className="text-xs text-slate-500">
              {lead.contactAttempts} contact attempts
            </span>
          </div>

          {lead.status !== 'converted' && lead.status !== 'lost' && (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onConvert}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Convert
              </Button>
              <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 text-red-600 border-red-200">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelled
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Lead as Cancelled</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Input
                      placeholder="Reason (optional)"
                      value={lostReason}
                      onChange={(e) => setLostReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowLostDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onMarkLost(lostReason);
                          setShowLostDialog(false);
                        }}
                      >
                        Mark as Cancelled
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Interaction Timeline */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Interactions
          </h4>
          <InteractionTimeline
            interactions={interactions}
            loading={interactionsLoading}
            leadId={lead.id}
          />
        </div>

        {/* Notes */}
        {lead.notes && (
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Notes</h4>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Meta */}
        <div className="text-xs text-slate-400 pt-2 border-t">
          <p>Source: {lead.source}</p>
          <p>Created: {new Date(lead.createdAt).toLocaleString()}</p>
          {lead.lastContactAt && (
            <p>Last Contact: {new Date(lead.lastContactAt).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// New Lead Form Component
function NewLeadForm({
  options,
  onSubmit,
  onCancel,
}: {
  options: any;
  onSubmit: (data: Partial<CrmLead>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    contactTitle: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    categoryInterested: '',
    partySize: '',
    occasion: '',
    preferredDate: '',
    budgetMin: '',
    budgetMax: '',
    specialRequests: '',
    source: 'website',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone,
        companyName: formData.companyName || undefined,
        contactTitle: formData.contactTitle || undefined,
        companyAddress: formData.companyAddress || undefined,
        companyCity: formData.companyCity || undefined,
        companyState: formData.companyState || undefined,
        companyZip: formData.companyZip || undefined,
        categoryInterested: formData.categoryInterested || undefined,
        partySize: formData.partySize ? parseInt(formData.partySize) : undefined,
        occasion: formData.occasion || undefined,
        preferredDate: formData.preferredDate || undefined,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        specialRequests: formData.specialRequests || undefined,
        source: formData.source as any,
        notes: formData.notes || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name *</label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Phone *</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <Input
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Title / Department</label>
          <Input
            value={formData.contactTitle}
            onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Business Address</label>
        <Input
          value={formData.companyAddress}
          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">City</label>
          <Input
            value={formData.companyCity}
            onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input
            value={formData.companyState}
            onChange={(e) => setFormData({ ...formData, companyState: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">ZIP</label>
          <Input
            value={formData.companyZip}
            onChange={(e) => setFormData({ ...formData, companyZip: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Plan Category</label>
          <Select
            value={formData.categoryInterested}
            onValueChange={(v) => setFormData({ ...formData, categoryInterested: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Household Size</label>
          <Input
            type="number"
            min="1"
            value={formData.partySize}
            onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Reason</label>
          <Select
            value={formData.occasion}
            onValueChange={(v) => setFormData({ ...formData, occasion: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_policy">New Policy</SelectItem>
              <SelectItem value="renewal">Renewal</SelectItem>
              <SelectItem value="upgrade">Plan Upgrade</SelectItem>
              <SelectItem value="group_enrollment">Group Enrollment</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Preferred Date</label>
          <Input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Source</label>
          <Select
            value={formData.source}
            onValueChange={(v) => setFormData({ ...formData, source: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="walk_in">Walk-in</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Special Requirements / Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md text-sm"
          rows={3}
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-yellow-500 hover:bg-yellow-600">
          {submitting ? 'Creating...' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
