'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, Pin } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useLeadsMap, type MapLead, type MapFilters } from '@/hooks/useLeadsMap';

const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 };
const DEFAULT_ZOOM = 11;

const STATUS_COLORS: Record<string, { background: string; border: string; glyph: string }> = {
  new:          { background: '#3b82f6', border: '#1d4ed8', glyph: '#ffffff' },
  contacted:    { background: '#a855f7', border: '#6b21a8', glyph: '#ffffff' },
  qualified:    { background: '#06b6d4', border: '#0e7490', glyph: '#ffffff' },
  quoted:       { background: '#eab308', border: '#a16207', glyph: '#ffffff' },
  negotiating:  { background: '#f97316', border: '#9a3412', glyph: '#ffffff' },
  converted:    { background: '#10b981', border: '#047857', glyph: '#ffffff' },
  lost:         { background: '#ef4444', border: '#b91c1c', glyph: '#ffffff' },
  unresponsive: { background: '#6b7280', border: '#374151', glyph: '#ffffff' },
  // Generic fallbacks shared with SystemsF1RST schema
  proposal:     { background: '#a855f7', border: '#6b21a8', glyph: '#ffffff' },
  negotiation:  { background: '#f97316', border: '#9a3412', glyph: '#ffffff' },
  won:          { background: '#10b981', border: '#047857', glyph: '#ffffff' },
};

function statusColor(status: string | null | undefined) {
  return STATUS_COLORS[status || 'new'] ?? STATUS_COLORS.new;
}

function leadName(lead: MapLead): string {
  return [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ') || 'Unknown contact';
}

function leadCoords(lead: MapLead): { lat: number; lng: number } | null {
  const lat = typeof lead.latitude === 'string' ? parseFloat(lead.latitude) : lead.latitude;
  const lng = typeof lead.longitude === 'string' ? parseFloat(lead.longitude) : lead.longitude;
  if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

interface ClusteredMarkersProps {
  leads: MapLead[];
  onPick: (lead: MapLead) => void;
}

function ClusteredMarkers({ leads, onPick }: ClusteredMarkersProps) {
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
        const c = statusColor(lead.status);
        return (
          <AdvancedMarker
            key={lead.id}
            position={coords}
            ref={(marker) => setMarkerRef(marker, String(lead.id))}
            onClick={() => onPick(lead)}
            title={leadName(lead)}
          >
            <Pin background={c.background} borderColor={c.border} glyphColor={c.glyph} />
          </AdvancedMarker>
        );
      })}
    </>
  );
}

interface LeadsMapProps {
  filters?: MapFilters;
}

export default function LeadsMap({ filters = {} }: LeadsMapProps) {
  const { data, isLoading, error } = useLeadsMap(filters);
  const [picked, setPicked] = useState<MapLead | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

  const leads = useMemo(() => data?.leads ?? [], [data]);
  const geocodedCount = leads.filter((l) => leadCoords(l)).length;
  const totalCount = leads.length;

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
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 text-xs shadow-md">
        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
        {isLoading ? (
          <span className="flex items-center gap-1 text-gray-700">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading leads…
          </span>
        ) : (
          <span className="text-gray-800 font-medium">
            {geocodedCount} of {totalCount} leads on map
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 text-xs shadow-md">
        <div className="font-semibold mb-2 text-gray-700">Status</div>
        {(['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'converted', 'lost', 'unresponsive'] as const).map((status) => {
          const c = STATUS_COLORS[status];
          return (
            <div key={status} className="flex items-center gap-2 py-0.5">
              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.background, borderColor: c.border }} />
              <span className="capitalize text-gray-700">{status}</span>
            </div>
          );
        })}
      </div>

      <APIProvider apiKey={apiKey}>
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
          <ClusteredMarkers leads={leads} onPick={setPicked} />

          {picked && pickedCoords && (
            <InfoWindow
              position={pickedCoords}
              onCloseClick={() => setPicked(null)}
              pixelOffset={[0, -40]}
            >
              <div className="min-w-[220px] max-w-[280px] text-gray-900">
                <div className="font-semibold text-sm">{leadName(picked)}</div>
                {picked.contact_title && (
                  <div className="text-xs text-gray-600">{picked.contact_title}</div>
                )}
                <div className="mt-1 text-sm font-medium text-gray-800">{picked.company_name || '—'}</div>
                {picked.industry && <div className="text-xs text-gray-600">{picked.industry}</div>}
                {picked.estimated_employees != null && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ~{Number(picked.estimated_employees).toLocaleString()} employees
                  </div>
                )}
                {picked.company_address && (
                  <div className="text-xs text-gray-500 mt-1">
                    {picked.company_address}
                    {picked.company_city ? `, ${picked.company_city}` : ''}
                    {picked.company_state ? `, ${picked.company_state}` : ''}
                  </div>
                )}
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
                <Link
                  href={`/dashboard/leads/${picked.id}`}
                  className="block mt-2 text-xs text-blue-600 hover:underline"
                >
                  Open lead →
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
