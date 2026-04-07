'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Loader2,
  X,
  Check,
  Ban,
  Video,
  Phone,
  MapPin,
  Bot,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar as CalendarIcon,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  salesCalendarApi,
  leadsApi,
  type SalesAppointment,
  type CreateSalesAppointmentData,
} from '@/lib/api';
import { cn } from '@/lib/utils';
// Insurance plan types used as dropdown options
const fleetBoats = [
  { id: '1', name: 'Individual Health' },
  { id: '2', name: 'Family Health' },
  { id: '3', name: 'Medicare Advantage' },
  { id: '4', name: 'Medicare Supplement' },
  { id: '5', name: 'Dental & Vision' },
  { id: '6', name: 'Group / Employer' },
];

type ViewMode = 'month' | 'week' | 'day';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const HOUR_HEIGHT = 64;
const GRID_START_HOUR = 4;
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + GRID_START_HOUR;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return { hour, label: `${displayHour} ${period}` };
});

// Format a Date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const appointmentTypes = [
  { value: 'discovery_call', label: 'Booking Inquiry', color: '#3B82F6' },
  { value: 'demo', label: 'Boat Tour / Viewing', color: '#8B5CF6' },
  { value: 'follow_up', label: 'Follow Up', color: '#10B981' },
  { value: 'proposal_review', label: 'Quote Review', color: '#F59E0B' },
  { value: 'closing_call', label: 'Booking Confirmation', color: '#EF4444' },
  { value: 'onboarding', label: 'Customer Check-in', color: '#06B6D4' },
  { value: 'check_in', label: 'Captain Briefing', color: '#EC4899' },
  { value: 'ai_scheduled', label: 'AI Scheduled', color: '#6366F1' },
];

const getTypeColor = (type: string): string => {
  const typeInfo = appointmentTypes.find(t => t.value === type);
  return typeInfo?.color || '#6B7280';
};

const getTypeLabel = (type: string): string => {
  const typeInfo = appointmentTypes.find(t => t.value === type);
  return typeInfo?.label || type;
};

const formatTime = (isoStr: string) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled': return <Badge variant="secondary">Scheduled</Badge>;
    case 'confirmed': return <Badge className="bg-blue-500">Confirmed</Badge>;
    case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
    case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
    case 'no_show': return <Badge variant="outline" className="text-red-500 border-red-500">No Show</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const getWeekDates = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(sunday);
    wd.setDate(sunday.getDate() + i);
    return wd;
  });
};

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
}

// Demo data for when API is not available
const DEMO_APPOINTMENTS: SalesAppointment[] = [
  {
    id: '1',
    sales_rep_id: '1',
    lead_id: '1',
    lead: { id: '1', first_name: 'John', last_name: 'Smith', email: 'john@example.com', phone: '+1234567890' },
    type: 'discovery_call',
    title: 'Booking Inquiry - John Smith',
    description: 'Initial call about pontoon rental for birthday party',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 30 * 60000).toISOString(),
    duration: 30,
    status: 'scheduled',
    location: 'Zoom',
    meeting_link: 'https://zoom.us/j/123456789',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    sales_rep_id: '1',
    lead_id: '2',
    lead: { id: '2', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
    type: 'demo',
    title: 'Boat Tour - Sarah Johnson',
    start_time: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    end_time: new Date(Date.now() + 3 * 60 * 60000).toISOString(),
    duration: 60,
    status: 'confirmed',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    sales_rep_id: '1',
    lead_id: '3',
    lead: { id: '3', first_name: 'Mike', last_name: 'Wilson', email: 'mike@example.com' },
    type: 'ai_scheduled',
    title: 'AI Scheduled Call - Mike Wilson',
    start_time: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    end_time: new Date(Date.now() + 24 * 60 * 60000 + 30 * 60000).toISOString(),
    duration: 30,
    status: 'scheduled',
    is_ai_scheduled: true,
    ai_call_id: 'ai-call-123',
    notes: 'Scheduled by AI Caller after lead expressed interest',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_LEADS: Lead[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', phone: '+1234567890' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
  { id: '3', firstName: 'Mike', lastName: 'Wilson', email: 'mike@example.com' },
  { id: '4', firstName: 'Emily', lastName: 'Brown', email: 'emily@example.com' },
];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<SalesAppointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const boats = fleetBoats;
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<SalesAppointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useDemo, setUseDemo] = useState(false);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateSalesAppointmentData>>({
    title: '',
    lead_id: '',
    date: '',
    start_time: '',
    end_time: '',
    duration: 180,
    type: 'discovery_call',
    notes: '',
    location: '',
    meeting_link: '',
    captain_name: '',
    boat_id: undefined,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'month') {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        startDate = toLocalDateStr(startOfMonth);
        endDate = toLocalDateStr(endOfMonth);
      } else if (viewMode === 'week') {
        const weekDates = getWeekDates(currentDate);
        startDate = toLocalDateStr(weekDates[0]);
        endDate = toLocalDateStr(weekDates[6]);
      } else {
        startDate = toLocalDateStr(currentDate);
        endDate = toLocalDateStr(currentDate);
      }

      // Fetch leads independently so they load even if appointments API fails
      leadsApi.getAll({ limit: 100 } as Parameters<typeof leadsApi.getAll>[0])
        .then((leadsRes: { data?: { data?: Lead[] } }) => {
          const leadsData = leadsRes.data?.data || [];
          if (Array.isArray(leadsData) && leadsData.length > 0) {
            setLeads(leadsData.map(l => ({
              id: l.id,
              firstName: l.firstName || '',
              lastName: l.lastName || '',
              email: l.email,
              phone: l.phone,
              company: l.company,
            })));
          }
        })
        .catch(() => {
          // Keep demo leads as fallback
          if (leads.length === 0) setLeads(DEMO_LEADS);
        });

      try {
        const appointmentsRes = await salesCalendarApi.getAppointments({ start_date: startDate, end_date: endDate });
        setAppointments(appointmentsRes.data?.appointments || []);
        setUseDemo(false);
      } catch {
        console.warn('Appointments API unavailable, using demo data');
        setAppointments(DEMO_APPOINTMENTS);
        setUseDemo(true);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setAppointments(DEMO_APPOINTMENTS);
      if (leads.length === 0) setLeads(DEMO_LEADS);
      setUseDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Boats are loaded from hardcoded fleet data (src/lib/boats.ts)

  // Auto-scroll time grid to 8 AM on mount and view change
  useEffect(() => {
    if ((viewMode === 'week' || viewMode === 'day') && timeGridRef.current) {
      const scrollTarget = (8 - GRID_START_HOUR) * HOUR_HEIGHT;
      timeGridRef.current.scrollTop = scrollTarget;
    }
  }, [viewMode, isLoading]);

  // Calendar grid generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    // Fill remaining cells to complete the grid row
    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
    }
    return calendarDays;
  };

  const calendarDays = getDaysInMonth(currentDate);
  const weekDates = getWeekDates(currentDate);

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      } else {
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getHeaderLabel = (): string => {
    if (viewMode === 'month') {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const wd = getWeekDates(currentDate);
      const start = wd[0];
      const end = wd[6];
      const startMonth = months[start.getMonth()].slice(0, 3);
      const endMonth = months[end.getMonth()].slice(0, 3);
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const openNewAppointment = () => {
    setSelectedAppointment(null);
    setFormData({
      title: '',
      lead_id: '',
      date: toLocalDateStr(selectedDate || new Date()),
      start_time: '09:00',
      duration: 30,
      type: 'discovery_call',
      notes: '',
      location: '',
      meeting_link: '',
    });
    setIsDialogOpen(true);
  };

  const openEditAppointment = (appointment: SalesAppointment) => {
    setSelectedAppointment(appointment);
    const startDate = new Date(appointment.start_time);
    setFormData({
      title: appointment.title,
      lead_id: appointment.lead_id || '',
      date: toLocalDateStr(startDate),
      start_time: startDate.toTimeString().slice(0, 5),
      duration: appointment.duration,
      type: appointment.type,
      notes: appointment.notes || '',
      location: appointment.location || '',
      meeting_link: appointment.meeting_link || '',
      captain_name: appointment.captain_name || '',
      boat_id: appointment.boat_id || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!formData.title || !formData.date || !formData.start_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.end_time) {
      toast.error('Please select an end time');
      return;
    }

    // Calculate duration in minutes from start/end times
    const [startH, startM] = formData.start_time.split(':').map(Number);
    const [endH, endM] = (formData.end_time).split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    // Clean form data: convert empty strings to null, cast IDs to integers
    const cleanData: Record<string, unknown> = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      start_time: formData.start_time,
      duration,
      lead_id: formData.lead_id ? Number(formData.lead_id) : null,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      notes: formData.notes || null,
      captain_name: formData.captain_name || null,
      boat_id: formData.boat_id ? Number(formData.boat_id) : null,
    };

    setIsSubmitting(true);
    try {
      if (useDemo) {
        if (selectedAppointment) {
          setAppointments(prev => prev.map(apt =>
            apt.id === selectedAppointment.id
              ? { ...apt, ...formData, duration, updated_at: new Date().toISOString() }
              : apt
          ));
          toast.success('Appointment updated (demo mode)');
        } else {
          const newApt: SalesAppointment = {
            id: Date.now().toString(),
            sales_rep_id: '1',
            lead_id: formData.lead_id || undefined,
            type: formData.type as SalesAppointment['type'],
            title: formData.title!,
            start_time: `${formData.date}T${formData.start_time}:00`,
            end_time: `${formData.date}T${formData.end_time}:00`,
            duration,
            status: 'scheduled',
            notes: formData.notes,
            location: formData.location,
            meeting_link: formData.meeting_link,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setAppointments(prev => [...prev, newApt]);
          toast.success('Appointment created (demo mode)');
        }
      } else {
        if (selectedAppointment) {
          await salesCalendarApi.updateAppointment(selectedAppointment.id, cleanData);
          toast.success('Appointment updated');
        } else {
          await salesCalendarApi.createAppointment(cleanData as CreateSalesAppointmentData);
          toast.success('Appointment created');
        }
        await fetchData();
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save appointment:', error);
      toast.error('Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      if (useDemo) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        toast.success('Appointment deleted (demo mode)');
      } else {
        await salesCalendarApi.deleteAppointment(id);
        toast.success('Appointment deleted');
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const handleStatusChange = async (id: string, action: 'complete' | 'cancel' | 'no_show') => {
    try {
      if (useDemo) {
        const statusMap = { complete: 'completed', cancel: 'cancelled', no_show: 'no_show' };
        setAppointments(prev => prev.map(apt =>
          apt.id === id ? { ...apt, status: statusMap[action] as SalesAppointment['status'] } : apt
        ));
        toast.success(`Appointment marked as ${statusMap[action]} (demo mode)`);
      } else {
        if (action === 'complete') await salesCalendarApi.markCompleted(id);
        else if (action === 'cancel') await salesCalendarApi.markCancelled(id);
        else if (action === 'no_show') await salesCalendarApi.markNoShow(id);
        toast.success(`Appointment marked as ${action}`);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast.error('Failed to update appointment');
    }
  };

  // Current time indicator position
  const now = new Date();
  const currentTimeOffset = ((now.getHours() - GRID_START_HOUR) * HOUR_HEIGHT) + ((now.getMinutes() / 60) * HOUR_HEIGHT);
  const showCurrentTimeLine = now.getHours() >= GRID_START_HOUR && now.getHours() < 22;

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);
  const todayAppointments = getAppointmentsForDate(new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Booking Calendar
          </h1>
          <p className="text-muted-foreground">
            Manage your bookings and appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {useDemo && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Demo Mode
            </Badge>
          )}
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border bg-muted p-0.5">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 text-xs font-medium capitalize',
                  viewMode === mode && 'shadow-sm'
                )}
              >
                {mode}
              </Button>
            ))}
          </div>
          <Button onClick={openNewAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[220px] text-center">
                  {getHeaderLabel()}
                </h2>
                <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* ========== MONTH VIEW ========== */}
            {viewMode === 'month' && (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-l">
                  {days.map(day => (
                    <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-2.5 bg-muted/30 border-r">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 border-l">
                  {calendarDays.map((date, index) => {
                    const dayAppointments = getAppointmentsForDate(date);

                    return (
                      <div
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        className={cn(
                          'min-h-[100px] p-1.5 cursor-pointer transition-colors border-r border-b',
                          !date && 'bg-muted/20 cursor-default',
                          date && 'hover:bg-accent/50',
                          isSelected(date) && !isToday(date) && 'bg-primary/10',
                          isToday(date) && 'bg-primary/5 ring-2 ring-primary ring-inset'
                        )}
                      >
                        {date && (
                          <>
                            <div className="mb-1">
                              {isToday(date) ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                  {date.getDate()}
                                </span>
                              ) : (
                                <span className={cn(
                                  'inline-flex items-center justify-center w-7 h-7 text-sm font-medium',
                                  isSelected(date) && 'text-primary font-semibold'
                                )}>
                                  {date.getDate()}
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              {dayAppointments.slice(0, 3).map(apt => (
                                <div
                                  key={apt.id}
                                  className="text-xs truncate rounded px-1.5 py-0.5 text-white font-medium cursor-pointer hover:opacity-90"
                                  style={{ backgroundColor: getTypeColor(apt.type) }}
                                  title={apt.title}
                                  onClick={(e) => { e.stopPropagation(); openEditAppointment(apt); }}
                                >
                                  {apt.is_ai_scheduled && <Bot className="h-2 w-2 inline mr-0.5" />}
                                  {formatTime(apt.start_time)}
                                </div>
                              ))}
                              {dayAppointments.length > 3 && (
                                <div className="text-xs text-muted-foreground px-1 font-medium">
                                  +{dayAppointments.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ========== WEEK VIEW ========== */}
            {viewMode === 'week' && (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-l">
                  <div className="border-r bg-muted/30" />
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        'text-center py-2.5 border-r cursor-pointer hover:bg-accent/30 transition-colors',
                        isToday(date) && 'bg-primary/5'
                      )}
                      onClick={() => { setSelectedDate(date); setViewMode('day'); setCurrentDate(date); }}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {days[i]}
                      </div>
                      <div className="mt-0.5">
                        {isToday(date) ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {date.getDate()}
                          </span>
                        ) : (
                          <span className="text-sm font-medium">{date.getDate()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                <div ref={timeGridRef} className="overflow-y-auto max-h-[600px] border-l">
                  <div className="grid grid-cols-[56px_repeat(7,1fr)]">
                    {/* Time gutter */}
                    <div>
                      {TIME_SLOTS.map(slot => (
                        <div key={slot.hour} className="h-16 border-r border-b text-[11px] text-muted-foreground text-right pr-2 pt-1">
                          {slot.label}
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDates.map((date, colIdx) => {
                      const dayApts = getAppointmentsForDate(date).filter(apt => {
                        const h = new Date(apt.start_time).getHours();
                        return h >= GRID_START_HOUR && h < 22;
                      });

                      return (
                        <div key={colIdx} className={cn('relative border-r', isToday(date) && 'bg-primary/[0.02]')}>
                          {/* Hour slot lines */}
                          {TIME_SLOTS.map(slot => (
                            <div
                              key={slot.hour}
                              className="h-16 border-b hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedDate(date);
                                setFormData(prev => ({
                                  ...prev,
                                  date: toLocalDateStr(date),
                                  start_time: `${String(slot.hour).padStart(2, '0')}:00`,
                                }));
                              }}
                            />
                          ))}

                          {/* Current time line */}
                          {showCurrentTimeLine && isToday(date) && (
                            <div
                              className="absolute left-0 right-0 z-20 pointer-events-none"
                              style={{ top: `${currentTimeOffset}px` }}
                            >
                              <div className="flex items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0" />
                                <div className="flex-1 border-t-2 border-red-500" />
                              </div>
                            </div>
                          )}

                          {/* Appointment blocks */}
                          {dayApts.map(apt => {
                            const startH = new Date(apt.start_time).getHours();
                            const startM = new Date(apt.start_time).getMinutes();
                            const topPx = ((startH - GRID_START_HOUR) * HOUR_HEIGHT) + ((startM / 60) * HOUR_HEIGHT);
                            const heightPx = Math.max(22, (apt.duration / 60) * HOUR_HEIGHT);

                            return (
                              <div
                                key={apt.id}
                                className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm overflow-hidden z-10"
                                style={{
                                  backgroundColor: getTypeColor(apt.type),
                                  top: `${topPx}px`,
                                  height: `${heightPx}px`,
                                }}
                                onClick={() => openEditAppointment(apt)}
                                title={`${apt.title} - ${formatTime(apt.start_time)}`}
                              >
                                <div className="text-[11px] font-semibold truncate leading-tight">
                                  {apt.is_ai_scheduled && <Bot className="h-2.5 w-2.5 inline mr-0.5" />}
                                  {formatTime(apt.start_time)}
                                </div>
                                {heightPx > 30 && (
                                  <div className="text-[10px] truncate opacity-90 leading-tight">
                                    {apt.title}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ========== DAY VIEW ========== */}
            {viewMode === 'day' && (
              <>
                {/* Day header */}
                <div className="flex items-center justify-between border-b pb-3 mb-0">
                  <div>
                    <h3 className="font-semibold text-base">
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getAppointmentsForDate(currentDate).length} appointment{getAppointmentsForDate(currentDate).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isToday(currentDate) && (
                    <Badge className="bg-primary">Today</Badge>
                  )}
                </div>

                {/* Time grid */}
                <div ref={timeGridRef} className="overflow-y-auto max-h-[600px] mt-0">
                  <div className="grid grid-cols-[56px_1fr] border-l">
                    {/* Time gutter */}
                    <div>
                      {TIME_SLOTS.map(slot => (
                        <div key={slot.hour} className="h-16 border-r border-b text-[11px] text-muted-foreground text-right pr-2 pt-1">
                          {slot.label}
                        </div>
                      ))}
                    </div>

                    {/* Day column */}
                    <div className={cn('relative border-r', isToday(currentDate) && 'bg-primary/[0.02]')}>
                      {/* Hour slot lines */}
                      {TIME_SLOTS.map(slot => (
                        <div
                          key={slot.hour}
                          className="h-16 border-b hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              date: toLocalDateStr(currentDate),
                              start_time: `${String(slot.hour).padStart(2, '0')}:00`,
                            }));
                          }}
                        />
                      ))}

                      {/* Current time line */}
                      {showCurrentTimeLine && isToday(currentDate) && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{ top: `${currentTimeOffset}px` }}
                        >
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0" />
                            <div className="flex-1 border-t-2 border-red-500" />
                          </div>
                        </div>
                      )}

                      {/* Appointment blocks */}
                      {getAppointmentsForDate(currentDate)
                        .filter(apt => {
                          const h = new Date(apt.start_time).getHours();
                          return h >= GRID_START_HOUR && h < 22;
                        })
                        .map(apt => {
                          const startH = new Date(apt.start_time).getHours();
                          const startM = new Date(apt.start_time).getMinutes();
                          const topPx = ((startH - GRID_START_HOUR) * HOUR_HEIGHT) + ((startM / 60) * HOUR_HEIGHT);
                          const heightPx = Math.max(44, (apt.duration / 60) * HOUR_HEIGHT);

                          return (
                            <div
                              key={apt.id}
                              className="absolute left-1 right-1 rounded-lg px-3 py-2 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md overflow-hidden z-10"
                              style={{
                                backgroundColor: getTypeColor(apt.type),
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                              }}
                              onClick={() => openEditAppointment(apt)}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                {apt.is_ai_scheduled && <Bot className="h-3.5 w-3.5 shrink-0" />}
                                <span className="font-semibold text-sm truncate">{apt.title}</span>
                                {getStatusBadge(apt.status)}
                              </div>
                              {heightPx > 50 && (
                                <div className="flex items-center gap-3 text-xs mt-1 opacity-90 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(apt.start_time)}
                                    {apt.end_time && ` - ${formatTime(apt.end_time)}`}
                                  </span>
                                  {apt.lead && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {apt.lead.first_name} {apt.lead.last_name}
                                    </span>
                                  )}
                                  {apt.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {apt.location}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              {appointmentTypes.map(type => (
                <div key={type.value} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-muted-foreground">{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule & Selected Date */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
              <CardDescription>
                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No appointments today
                </p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => openEditAppointment(apt)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {apt.is_ai_scheduled && (
                              <Bot className="h-3 w-3 text-indigo-500" />
                            )}
                            <span className="font-medium text-sm truncate">{apt.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(apt.start_time)}
                            <span>({apt.duration} min)</span>
                          </div>
                          {apt.lead && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <User className="h-3 w-3" />
                              {apt.lead.first_name} {apt.lead.last_name}
                            </div>
                          )}
                        </div>
                        <div
                          className="w-2 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: getTypeColor(apt.type) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Date Appointments (hidden in day view since main area shows the detail) */}
          {viewMode !== 'day' && selectedDate && selectedDate.toDateString() !== new Date().toDateString() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </CardTitle>
                <CardDescription>
                  {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      No appointments scheduled
                    </p>
                    <Button variant="outline" size="sm" onClick={openNewAppointment}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className="p-3 rounded-lg border group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditAppointment(apt)}>
                            <div className="flex items-center gap-2 mb-1">
                              {apt.is_ai_scheduled && (
                                <Bot className="h-3 w-3 text-indigo-500" />
                              )}
                              <span className="font-medium text-sm truncate">{apt.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(apt.start_time)}
                            </div>
                            {apt.lead && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <User className="h-3 w-3" />
                                {apt.lead.first_name} {apt.lead.last_name}
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditAppointment(apt)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(apt.id, 'complete')}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(apt.id, 'cancel')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(apt.id, 'no_show')}>
                                <Ban className="h-4 w-4 mr-2 text-orange-500" />
                                No Show
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment
                ? 'Update the appointment details'
                : 'Schedule a new sales appointment'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Discovery Call - John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CreateSalesAppointmentData['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead">Lead</Label>
                <Select
                  value={formData.lead_id || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, lead_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead selected</SelectItem>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.firstName} {lead.lastName}
                        {lead.company && ` (${lead.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time || ''}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    // Auto-set end time 3 hours after start if not already set
                    let newEnd = formData.end_time;
                    if (!newEnd && newStart) {
                      const [h, m] = newStart.split(':').map(Number);
                      const endH = Math.min(h + 3, 23);
                      newEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    }
                    setFormData({ ...formData, start_time: newStart, end_time: newEnd });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Zoom, Office, Phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link || ''}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="captain_name">Captain Name</Label>
                <Input
                  id="captain_name"
                  value={formData.captain_name || ''}
                  onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
                  placeholder="e.g., Captain Mike"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boat_id">Boat</Label>
                <Select
                  value={formData.boat_id ? String(formData.boat_id) : 'none'}
                  onValueChange={(value) => setFormData({ ...formData, boat_id: value === 'none' ? undefined : value as unknown as number })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select boat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No boat selected</SelectItem>
                    {boats.map(boat => (
                      <SelectItem key={boat.slug} value={boat.name}>
                        <div className="flex items-center gap-2">
                          <span>{boat.emoji}</span>
                          {boat.name} ({boat.capacity} guests)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes or agenda items..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAppointment} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedAppointment ? 'Update' : 'Create'} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
