'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  Pin,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import {
  MapPin,
  Loader2,
  AlertCircle,
  Square,
  Navigation,
  Tag as TagIcon,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLeadsMap, type MapLead, type MapFilters } from '@/hooks/useLeadsMap';
import { leadsApi } from '@/lib/api';
import type { ColorMode } from '@/components/crm/MapTab';

const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 };
const DEFAULT_ZOOM = 9;

interface PinColor { background: string; border: string; glyph: string }

const STATUS_COLORS: Record<string, PinColor> = {
  new:          { background: '#3b82f6', border: '#1d4ed8', glyph: '#ffffff' },
  contacted:    { background: '#a855f7', border: '#6b21a8', glyph: '#ffffff' },
  qualified:    { background: '#06b6d4', border: '#0e7490', glyph: '#ffffff' },
  quoted:       { background: '#eab308', border: '#a16207', glyph: '#ffffff' },
  negotiating:  { background: '#f97316', border: '#9a3412', glyph: '#ffffff' },
  converted:    { background: '#10b981', border: '#047857', glyph: '#ffffff' },
  lost:         { background: '#ef4444', border: '#b91c1c', glyph: '#ffffff' },
  unresponsive: { background: '#6b7280', border: '#374151', glyph: '#ffffff' },
  proposal:     { background: '#a855f7', border: '#6b21a8', glyph: '#ffffff' },
  negotiation:  { background: '#f97316', border: '#9a3412', glyph: '#ffffff' },
  won:          { background: '#10b981', border: '#047857', glyph: '#ffffff' },
};

const EMPLOYEE_BANDS: { label: string; min: number; color: PinColor }[] = [
  { label: '1,000+ employees',  min: 1000, color: { background: '#dc2626', border: '#991b1b', glyph: '#ffffff' } },
  { label: '500–999 employees', min: 500,  color: { background: '#ea580c', border: '#9a3412', glyph: '#ffffff' } },
  { label: '100–499 employees', min: 100,  color: { background: '#eab308', border: '#854d0e', glyph: '#ffffff' } },
  { label: '<100 employees',    min: 1,    color: { background: '#3b82f6', border: '#1d4ed8', glyph: '#ffffff' } },
  { label: 'Unknown size',      min: -1,   color: { background: '#9ca3af', border: '#4b5563', glyph: '#ffffff' } },
];

function bandFor(emp: number | null | undefined): { label: string; color: PinColor } {
  if (emp == null || emp <= 0) return EMPLOYEE_BANDS[4];
  const hit = EMPLOYEE_BANDS.find((b) => b.min >= 0 && emp >= b.min);
  return hit ?? EMPLOYEE_BANDS[4];
}

function statusColor(status: string | null | undefined): PinColor {
  return STATUS_COLORS[status || 'new'] ?? STATUS_COLORS.new;
}

function pinColor(lead: MapLead, mode: ColorMode): PinColor {
  return mode === 'employees' ? bandFor(lead.estimated_employees).color : statusColor(lead.status);
}

function leadName(lead: MapLead): string {
  return [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ') || 'Unknown contact';
}

function leadCoords(lead: MapLead): { lat: number; lng: number } | null {
  const lat = typeof lead.latitude === 'string' ? parseFloat(lead.latitude) : lead.latitude;
  const lng = typeof lead.longitude === 'string' ? parseFloat(lead.longitude) : lead.longitude;
  if (lat === null || lng === null || Number.isNaN(lat as number) || Number.isNaN(lng as number)) return null;
  return { lat: lat as number, lng: lng as number };
}

function buildRouteUrl(leads: MapLead[]): string {
  const coords = leads
    .map((l) => leadCoords(l))
    .filter((c): c is { lat: number; lng: number } => !!c)
    .map((c) => `${c.lat},${c.lng}`);
  if (coords.length === 0) return '';
  if (coords.length === 1) return `https://www.google.com/maps/search/?api=1&query=${coords[0]}`;
  // Google Maps URL accepts up to 10 stops (1 origin + 8 waypoints + 1 destination)
  const trimmed = coords.slice(0, 10);
  const origin = trimmed[0];
  const destination = trimmed[trimmed.length - 1];
  const waypoints = trimmed.slice(1, -1).join('|');
  const wp = waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '';
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${wp}&travelmode=driving`;
}

// ----- Rectangle drawing manager -----

interface RectangleDrawerProps {
  active: boolean;
  onSelect: (bounds: google.maps.LatLngBounds) => void;
  onDone: () => void;
}

function RectangleDrawer({ active, onSelect, onDone }: RectangleDrawerProps) {
  const map = useMap();
  const drawingLib = useMapsLibrary('drawing');
  const managerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    if (!map || !drawingLib) return;
    if (!managerRef.current) {
      managerRef.current = new drawingLib.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        rectangleOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          strokeColor: '#1d4ed8',
          strokeWeight: 2,
          clickable: false,
          editable: false,
          zIndex: 10,
        },
      });
      managerRef.current.setMap(map);
      listenerRef.current = google.maps.event.addListener(
        managerRef.current,
        'rectanglecomplete',
        (rect: google.maps.Rectangle) => {
          const bounds = rect.getBounds();
          if (bounds) onSelect(bounds);
          rect.setMap(null);
          managerRef.current?.setDrawingMode(null);
          onDone();
        }
      );
    }
    return () => {
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      managerRef.current?.setMap(null);
      managerRef.current = null;
    };
  }, [map, drawingLib, onSelect, onDone]);

  useEffect(() => {
    if (!managerRef.current || !drawingLib) return;
    managerRef.current.setDrawingMode(
      active ? google.maps.drawing.OverlayType.RECTANGLE : null
    );
  }, [active, drawingLib]);

  return null;
}

// ----- Clustered markers -----

interface ClusteredMarkersProps {
  leads: MapLead[];
  colorBy: ColorMode;
  selectedIds: Set<number>;
  onPick: (lead: MapLead) => void;
}

function ClusteredMarkers({ leads, colorBy, selectedIds, onPick }: ClusteredMarkersProps) {
  const map = useMap();
  const markersRef = useRef<Record<string, Marker>>({});
  const clustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    const clusterer = clustererRef.current;
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markersRef.current));
  });

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markersRef.current[key] !== marker) {
      markersRef.current[key] = marker;
    } else if (!marker && markersRef.current[key]) {
      delete markersRef.current[key];
    }
  };

  return (
    <>
      {leads.map((lead) => {
        const coords = leadCoords(lead);
        if (!coords) return null;
        const c = pinColor(lead, colorBy);
        const selected = selectedIds.has(lead.id);
        return (
          <AdvancedMarker
            key={lead.id}
            position={coords}
            ref={(marker) => setMarkerRef(marker, String(lead.id))}
            onClick={() => onPick(lead)}
            title={leadName(lead)}
          >
            <Pin
              background={c.background}
              borderColor={selected ? '#1e293b' : c.border}
              glyphColor={c.glyph}
              scale={selected ? 1.4 : 1}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}

// ----- Main map component -----

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'converted', 'lost', 'unresponsive'];

interface LeadsMapProps {
  filters?: MapFilters;
  colorBy?: ColorMode;
}

export default function LeadsMap({ filters = {}, colorBy = 'employees' }: LeadsMapProps) {
  const { data, isLoading, error } = useLeadsMap(filters);
  const [picked, setPicked] = useState<MapLead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [localLeads, setLocalLeads] = useState<MapLead[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

  // Local copy so we can do optimistic status/tag updates without refetching everything
  useEffect(() => {
    if (data?.leads) setLocalLeads(data.leads);
  }, [data]);

  const leads = localLeads;
  const geocodedCount = leads.filter((l) => leadCoords(l)).length;
  const totalCount = leads.length;
  const selectedLeads = useMemo(
    () => leads.filter((l) => selectedIds.has(l.id)),
    [leads, selectedIds]
  );

  const onRectangleSelect = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      const next = new Set<number>(selectedIds);
      for (const lead of leads) {
        const c = leadCoords(lead);
        if (!c) continue;
        if (bounds.contains(c)) next.add(lead.id);
      }
      setSelectedIds(next);
      if (next.size > selectedIds.size) {
        toast.success(`Added ${next.size - selectedIds.size} to selection (${next.size} total)`);
      }
    },
    [leads, selectedIds]
  );

  const clearSelection = () => setSelectedIds(new Set());

  const updateLocalLead = useCallback((id: number, patch: Partial<MapLead>) => {
    setLocalLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const handlePickedStatusChange = async (newStatus: string) => {
    if (!picked) return;
    const prev = picked.status;
    updateLocalLead(picked.id, { status: newStatus });
    setPicked({ ...picked, status: newStatus });
    try {
      await leadsApi.updateStatus(String(picked.id), newStatus);
      toast.success(`Marked as ${newStatus}`);
    } catch (e) {
      updateLocalLead(picked.id, { status: prev });
      setPicked({ ...picked, status: prev });
      toast.error(`Failed to update status: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handlePickedAddTag = async (tag: string) => {
    if (!picked) return;
    const prevTags = picked.tags ?? [];
    if (prevTags.includes(tag)) {
      toast(`Already tagged "${tag}"`);
      return;
    }
    const nextTags = [...prevTags, tag];
    updateLocalLead(picked.id, { tags: nextTags });
    setPicked({ ...picked, tags: nextTags });
    try {
      await leadsApi.update(String(picked.id), { tags: nextTags } as never);
      toast.success(`Tagged "${tag}"`);
    } catch (e) {
      updateLocalLead(picked.id, { tags: prevTags });
      setPicked({ ...picked, tags: prevTags });
      toast.error(`Failed to tag: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedLeads.length === 0) return;
    setBulkLoading(true);
    selectedLeads.forEach((l) => updateLocalLead(l.id, { status: newStatus }));
    const results = await Promise.allSettled(
      selectedLeads.map((l) => leadsApi.updateStatus(String(l.id), newStatus))
    );
    setBulkLoading(false);
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (failed === 0) toast.success(`Updated ${ok} leads to ${newStatus}`);
    else toast.error(`${ok} succeeded, ${failed} failed`);
  };

  const handleBulkTag = async (tag: string) => {
    if (selectedLeads.length === 0) return;
    setBulkLoading(true);
    const results = await Promise.allSettled(
      selectedLeads.map((l) => {
        const next = Array.from(new Set([...(l.tags ?? []), tag]));
        updateLocalLead(l.id, { tags: next });
        return leadsApi.update(String(l.id), { tags: next } as never);
      })
    );
    setBulkLoading(false);
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (failed === 0) toast.success(`Tagged ${ok} leads "${tag}"`);
    else toast.error(`${ok} succeeded, ${failed} failed`);
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-3" />
        <h3 className="text-lg font-semibold mb-1">Map not configured</h3>
        <p className="text-sm text-gray-500">
          <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is not set in this environment.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-semibold mb-1">Failed to load map data</h3>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  const pickedCoords = picked ? leadCoords(picked) : null;

  return (
    <div className="relative w-full h-full">
      {/* Status pill */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 text-xs shadow-md">
        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
        {isLoading ? (
          <span className="flex items-center gap-1 text-gray-700">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading leads…
          </span>
        ) : (
          <span className="text-gray-800 font-medium">
            {geocodedCount.toLocaleString()} of {totalCount.toLocaleString()} leads on map
          </span>
        )}
      </div>

      {/* Select-on-map toggle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <button
          type="button"
          onClick={() => setSelectMode((v) => !v)}
          className={
            'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shadow-md border transition-colors ' +
            (selectMode
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white/95 text-gray-800 border-gray-200 hover:bg-gray-50')
          }
        >
          <Square className="w-3.5 h-3.5" />
          {selectMode ? 'Drag a rectangle on the map…' : 'Select on map'}
        </button>
      </div>

      {/* Selection panel */}
      {selectedIds.size > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[260px] max-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">{selectedIds.size} lead{selectedIds.size === 1 ? '' : 's'} selected</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const url = buildRouteUrl(selectedLeads);
              if (url) window.open(url, '_blank');
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 font-medium mb-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            Build Route in Google Maps
            {selectedLeads.length > 10 && (
              <span className="text-[10px] opacity-80 ml-1">(first 10)</span>
            )}
          </button>
          <div className="mb-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Set status</label>
            <select
              aria-label="Set status for selected leads"
              disabled={bulkLoading}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatus(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full mt-1 border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-800 bg-white disabled:opacity-50"
              defaultValue=""
            >
              <option value="">Choose status…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Quick tag</label>
            <div className="flex gap-1.5 mt-1">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleBulkTag('visited')}
                className="flex-1 flex items-center justify-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-md px-2 py-1.5 hover:bg-emerald-100 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3 h-3" /> Visited
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleBulkTag('lost')}
                className="flex-1 flex items-center justify-center gap-1 border border-red-300 bg-red-50 text-red-700 rounded-md px-2 py-1.5 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" /> Lost
              </button>
            </div>
          </div>
          {bulkLoading && (
            <div className="mt-2 flex items-center gap-1 text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating…
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-3 text-xs shadow-md">
        <div className="font-semibold mb-2 text-gray-700 uppercase tracking-wide text-[10px]">
          {colorBy === 'employees' ? 'Employee Size' : 'Status'}
        </div>
        {colorBy === 'employees'
          ? EMPLOYEE_BANDS.map((b) => (
              <div key={b.label} className="flex items-center gap-2 py-0.5">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: b.color.background, borderColor: b.color.border }}
                />
                <span className="text-gray-700">{b.label}</span>
              </div>
            ))
          : (['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'converted', 'lost', 'unresponsive'] as const).map((s) => {
              const c = STATUS_COLORS[s];
              return (
                <div key={s} className="flex items-center gap-2 py-0.5">
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: c.background, borderColor: c.border }}
                  />
                  <span className="capitalize text-gray-700">{s}</span>
                </div>
              );
            })}
      </div>

      <APIProvider apiKey={apiKey} libraries={['marker', 'drawing']}>
        <Map
          defaultCenter={AUSTIN_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl
          zoomControl
          className="w-full h-full rounded-lg"
        >
          <ClusteredMarkers
            leads={leads}
            colorBy={colorBy}
            selectedIds={selectedIds}
            onPick={setPicked}
          />

          <RectangleDrawer
            active={selectMode}
            onSelect={onRectangleSelect}
            onDone={() => setSelectMode(false)}
          />

          {picked && pickedCoords && (
            <InfoWindow
              position={pickedCoords}
              onCloseClick={() => setPicked(null)}
              pixelOffset={[0, -40]}
            >
              <div className="min-w-[240px] max-w-[300px] text-gray-900">
                <div className="font-semibold text-sm">{leadName(picked)}</div>
                {picked.contact_title && (
                  <div className="text-xs text-gray-600">{picked.contact_title}</div>
                )}
                <div className="mt-1 text-sm font-medium text-gray-800">{picked.company_name || '—'}</div>
                {picked.industry && <div className="text-xs text-gray-600">{picked.industry}</div>}
                {picked.estimated_employees != null && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ~{Number(picked.estimated_employees).toLocaleString()} employees · {bandFor(picked.estimated_employees).label}
                  </div>
                )}
                {picked.company_address && (
                  <div className="text-xs text-gray-500 mt-1">
                    {picked.company_address}
                    {picked.company_city ? `, ${picked.company_city}` : ''}
                    {picked.company_state ? `, ${picked.company_state}` : ''}
                  </div>
                )}

                {/* Status pill + dropdown */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: statusColor(picked.status).background + '22',
                      color: statusColor(picked.status).background,
                    }}
                  >
                    {picked.status || 'new'}
                  </span>
                  {picked.priority && (
                    <span className="text-[10px] text-gray-500 uppercase">{picked.priority}</span>
                  )}
                </div>

                <div className="mt-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Update status</label>
                  <select
                    aria-label="Update lead status"
                    value={picked.status ?? 'new'}
                    onChange={(e) => handlePickedStatusChange(e.target.value)}
                    className="w-full mt-0.5 border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-800 bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePickedAddTag('visited')}
                    className="flex-1 flex items-center justify-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-md px-2 py-1 text-xs hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Visited
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePickedAddTag('lost')}
                    className="flex-1 flex items-center justify-center gap-1 border border-red-300 bg-red-50 text-red-700 rounded-md px-2 py-1 text-xs hover:bg-red-100"
                  >
                    <XCircle className="w-3 h-3" /> Lost
                  </button>
                </div>

                {picked.tags && picked.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {picked.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        <TagIcon className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/dashboard/leads/${picked.id}`}
                  className="block mt-2 text-xs text-blue-600 hover:underline"
                >
                  Open full lead →
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
