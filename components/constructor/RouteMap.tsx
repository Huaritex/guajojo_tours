'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTripStore, type Activity } from '@/store/tripStore'
import {
  MapPin, Clock, Route, Navigation, ChevronDown, LocateFixed,
  AlertCircle, Loader2, Map as MapIcon, X,
} from 'lucide-react'

// ── Mapbox token ──
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// ── Haversine distance (km) ──
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[1] - a[1]) * Math.PI) / 180
  const dLng = ((b[0] - a[0]) * Math.PI) / 180
  const lat1 = (a[1] * Math.PI) / 180
  const lat2 = (b[1] * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function formatTime(minutes: number): string {
  if (!isFinite(minutes) || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)\s*hora/)
  const minsMatch = duration.match(/(\d+)\s*min/)
  const h = hoursMatch ? parseInt(hoursMatch[1]) : 0
  const m = minsMatch ? parseInt(minsMatch[1]) : 0
  return h * 60 + m
}

// Mapbox [lng, lat] — note: Mapbox uses [lng, lat] order
const BASE_LNG_LAT: [number, number] = [-63.8656, -18.1784] // Plaza de Samaipata

const dayAccents = [
  { color: '#34d399', label: 'Día 1', rgb: '52,211,153' },
  { color: '#d4a574', label: 'Día 2', rgb: '212,165,116' },
  { color: '#a78bfa', label: 'Día 3', rgb: '167,139,250' },
]

const categoryColors: Record<string, string> = {
  cultura: '#d4a574',
  aventura: '#34d399',
  gastronomia: '#f59e0b',
  naturaleza: '#60a5fa',
}

interface RoutePoint {
  lngLat: [number, number]   // [lng, lat] for Mapbox
  name: string
  category: string
  dayIndex: number
  slot: 'morning' | 'afternoon'
  duration: string
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

interface RouteStats {
  distanceKm: number
  travelMinutes: number
  activityMinutes: number
  fromUserKm: number | null   // extra distance from user to first point
}

// ── Fetch real driving route from Mapbox Directions API ──
async function fetchDirectionsRoute(
  waypoints: [number, number][],  // [lng, lat][]
): Promise<{ coords: [number, number][]; distanceKm: number; durationMin: number } | null> {
  if (waypoints.length < 2) return null
  // Mapbox Directions supports max 25 waypoints
  const coords = waypoints.slice(0, 25).map((p) => p.join(',')).join(';')
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const route = data.routes?.[0]
    if (!route) return null
    return {
      coords: route.geometry.coordinates as [number, number][],
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
    }
  } catch {
    return null
  }
}

export default function RouteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('mapbox-gl').Map | null>(null)
  const markersRef = useRef<import('mapbox-gl').Marker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [userLngLat, setUserLngLat] = useState<[number, number] | null>(null)
  const [routeStats, setRouteStats] = useState<RouteStats>({
    distanceKm: 0, travelMinutes: 0, activityMinutes: 0, fromUserKm: null,
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)

  const days = useTripStore((s) => s.days)
  const mapVisible = useTripStore((s) => s.mapVisible)

  // ── Build ordered route points [lng, lat] ──
  const routePoints: RoutePoint[] = days.flatMap((day, dayIndex) =>
    (['morning', 'afternoon'] as const)
      .map((slot) => {
        const act = day[slot] as Activity | null
        if (!act || !act.coordinates) return null
        return {
          lngLat: [act.coordinates[1], act.coordinates[0]] as [number, number], // [lng, lat]
          name: act.name,
          category: act.category,
          dayIndex,
          slot,
          duration: act.duration,
        }
      })
      .filter((x): x is RoutePoint => x !== null)
  )

  const hasPoints = routePoints.length > 0

  // ── Draw route on the map ──
  const drawRoute = useCallback(async (map: import('mapbox-gl').Map, userPos?: [number, number] | null) => {
    if (!hasPoints) return
    setIsCalculating(true)

    // Build waypoint list
    const waypoints: [number, number][] = [
      ...(userPos ? [userPos] : [BASE_LNG_LAT]),
      ...routePoints.map((p) => p.lngLat),
      BASE_LNG_LAT, // return to base
    ]

    // Try Mapbox Directions API for real road route
    const directions = await fetchDirectionsRoute(waypoints)

    // Remove existing route layers/sources
    if (map.getLayer('route-line-shadow')) map.removeLayer('route-line-shadow')
    if (map.getLayer('route-line')) map.removeLayer('route-line')
    if (map.getSource('route-source')) map.removeSource('route-source')

    const lineCoords = directions ? directions.coords : waypoints

    map.addSource('route-source', {
      type: 'geojson',
      lineMetrics: true,          // required for line-gradient
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: lineCoords },
      },
    })

    // Shadow line
    map.addLayer({
      id: 'route-line-shadow',
      type: 'line',
      source: 'route-source',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#000', 'line-width': 8, 'line-opacity': 0.35, 'line-blur': 4 },
    })

    // Main gradient route line
    // Note: line-gradient requires lineMetrics:true on the source.
    // line-color must NOT use line-progress — only line-gradient can.
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-source',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#34d399',          // solid fallback color
        'line-width': 4,
        'line-opacity': 0.92,
        'line-gradient': [                 // gradient along the line
          'interpolate', ['linear'], ['line-progress'],
          0,   '#34d399',
          0.5, '#d4a574',
          1,   '#a78bfa',
        ],
      },
    })

    // Calculate stats
    const actMin = days.flatMap((d) => [d.morning, d.afternoon])
      .filter((a): a is Activity => a !== null)
      .reduce((sum, a) => sum + parseDuration(a.duration), 0)

    let distanceKm: number
    let travelMin: number
    let fromUserKm: number | null = null

    if (directions) {
      distanceKm = directions.distanceKm
      travelMin = directions.durationMin
    } else {
      // Fallback: Haversine
      let totalKm = 0
      for (let i = 0; i < waypoints.length - 1; i++) {
        totalKm += haversine(waypoints[i], waypoints[i + 1])
      }
      distanceKm = Math.round(totalKm * 10) / 10
      travelMin = Math.round((totalKm / 40) * 60)
    }

    if (userPos) {
      fromUserKm = Math.round(haversine(userPos, BASE_LNG_LAT) * 10) / 10
    }

    setRouteStats({ distanceKm, travelMinutes: travelMin, activityMinutes: actMin, fromUserKm })

    // Fit map to all points
    const allCoords = lineCoords as [number, number][]
    const lngs = allCoords.map((c) => c[0])
    const lats = allCoords.map((c) => c[1])
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs) - 0.02, Math.min(...lats) - 0.02],
      [Math.max(...lngs) + 0.02, Math.max(...lats) + 0.02],
    ]
    map.fitBounds(bounds, { padding: 60, duration: 1200 })

    setIsCalculating(false)
  }, [hasPoints, routePoints, days])

  // ── Place markers ──
  const placeMarkers = useCallback(async (map: import('mapbox-gl').Map, userPos?: [number, number] | null) => {
    const mapboxgl = (await import('mapbox-gl')).default

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // User location marker
    if (userPos) {
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width:44px;height:44px;border-radius:50%;
          background:rgba(99,179,237,0.15);
          border:2px solid rgba(99,179,237,0.7);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 0 8px rgba(99,179,237,0.12),0 4px 16px rgba(0,0,0,0.5);
          animation:userPulse 2s ease-in-out infinite;
        ">
          <div style="
            width:16px;height:16px;border-radius:50%;
            background:#63b3ed;
            box-shadow:0 0 12px rgba(99,179,237,0.8);
          "></div>
        </div>
      `
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(userPos)
        .setPopup(
          new mapboxgl.Popup({ offset: 14, closeButton: false })
            .setHTML('<div style="font-size:12px;padding:4px 2px;color:#fafaf9"><b>Tu ubicación</b></div>')
        )
        .addTo(map)
      markersRef.current.push(marker)
    }

    // Base marker
    const baseEl = document.createElement('div')
    baseEl.innerHTML = `
      <div style="
        width:40px;height:40px;border-radius:50%;
        background:rgba(10,10,10,0.88);
        border:2.5px solid rgba(255,255,255,0.55);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 4px rgba(255,255,255,0.1),0 6px 20px rgba(0,0,0,0.6);
        font-size:18px;cursor:pointer;
      ">🏨</div>
    `
    const baseMarker = new mapboxgl.Marker({ element: baseEl, anchor: 'center' })
      .setLngLat(BASE_LNG_LAT)
      .setPopup(
        new mapboxgl.Popup({ offset: 22, closeButton: false })
          .setHTML('<div style="font-size:12px;padding:6px 4px;color:#fafaf9"><b>Base · Plaza de Samaipata</b><br><span style="color:#a8a29e;font-size:11px">Punto de partida y regreso</span></div>')
      )
      .addTo(map)
    markersRef.current.push(baseMarker)

    // Activity markers
    routePoints.forEach((pt, idx) => {
      const accent = dayAccents[pt.dayIndex] ?? dayAccents[0]
      const catColor = categoryColors[pt.category] ?? '#34d399'
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:rgba(8,12,10,0.92);
          border:2.5px solid ${catColor};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 0 4px rgba(${accent.rgb},0.18),0 6px 18px rgba(0,0,0,0.6);
          font-size:12px;font-weight:700;color:${catColor};
          font-family:system-ui,sans-serif;cursor:pointer;
          transition:transform 0.2s ease;
        " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ${idx + 1}
        </div>
      `
      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false })
        .setHTML(`
          <div style="font-size:12px;padding:6px 4px;color:#fafaf9;min-width:160px">
            <b style="font-size:13px">${pt.name}</b><br>
            <span style="color:#a8a29e;font-size:11px">${accent.label} · ${pt.slot === 'morning' ? 'Mañana' : 'Tarde'}</span><br>
            <span style="color:${catColor};font-size:11px">⏱ ${pt.duration}</span>
          </div>
        `)
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(pt.lngLat)
        .setPopup(popup)
        .addTo(map)
      markersRef.current.push(marker)
    })
  }, [routePoints])

  // ── Init Mapbox map ──
  useEffect(() => {
    if (!mapVisible || !hasPoints || !mapContainerRef.current || mapReady) return

    let cancelled = false

    async function initMap() {
      const mapboxgl = (await import('mapbox-gl')).default
      mapboxgl.accessToken = MAPBOX_TOKEN

      if (cancelled || !mapContainerRef.current) return

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: BASE_LNG_LAT,
        zoom: 11,
        attributionControl: false,
        logoPosition: 'bottom-right',
        scrollZoom: true,
      })

      mapRef.current = map

      // Custom attribution
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

      // Navigation controls (zoom + rotate + compass)
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }),
        'top-right'
      )

      // Scale bar
      map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left')

      // Full screen
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      map.on('load', () => {
        if (cancelled) return
        setMapReady(true)
        placeMarkers(map, null)
        drawRoute(map, null)

        // ── Capture wheel events on the canvas so Lenis / page scroll
        //    doesn't steal them. stopPropagation prevents the event
        //    from bubbling to Lenis; Mapbox GL receives it first.
        const canvas = map.getCanvas()
        const wheelHandler = (e: WheelEvent) => {
          e.stopPropagation()
          // Do NOT preventDefault here — Mapbox handles zoom internally.
        }
        canvas.addEventListener('wheel', wheelHandler, { passive: true, capture: true })

        // Cleanup stored on the map instance for later removal
        ;(map as any)._wheelHandler = wheelHandler
        ;(map as any)._wheelCanvas = canvas
      })

      // Enable touch rotation and pitch on mobile
      map.dragRotate.enable()
      map.touchZoomRotate.enableRotation()
    }

    initMap()

    return () => {
      cancelled = true
    }
  }, [mapVisible, hasPoints])

  // ── Re-draw when routePoints or userLngLat changes ──
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    placeMarkers(map, userLngLat)
    drawRoute(map, userLngLat)
  }, [routePoints.length, userLngLat, mapReady])

  // ── Invalidate size when expanded ──
  useEffect(() => {
    if (isExpanded && mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 320)
    }
  }, [isExpanded])

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      const map = mapRef.current
      if (map) {
        // Remove wheel handler before destroying map
        const canvas = (map as any)._wheelCanvas as HTMLCanvasElement | undefined
        const handler = (map as any)._wheelHandler as ((e: WheelEvent) => void) | undefined
        if (canvas && handler) {
          canvas.removeEventListener('wheel', handler, { capture: true })
        }
        map.remove()
        mapRef.current = null
      }
      markersRef.current.forEach((m) => m.remove())
    }
  }, [])

  // ── Geolocation request ──
  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable')
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoStatus('requesting')
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setUserLngLat(lngLat)
        setGeoStatus('granted')
        // Fly to user first
        if (mapRef.current) {
          mapRef.current.flyTo({ center: lngLat, zoom: 9, duration: 1500 })
          setTimeout(() => {
            placeMarkers(mapRef.current!, lngLat)
            drawRoute(mapRef.current!, lngLat)
          }, 1600)
        }
      },
      (err) => {
        setGeoStatus('denied')
        setGeoError(
          err.code === 1
            ? 'Permiso de ubicación denegado. Puedes activarlo en la configuración del navegador.'
            : 'No se pudo obtener tu ubicación. Intenta de nuevo.'
        )
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }, [placeMarkers, drawRoute])

  // ── Center on user ──
  const flyToUser = useCallback(() => {
    if (userLngLat && mapRef.current) {
      mapRef.current.flyTo({ center: userLngLat, zoom: 12, duration: 1200 })
    }
  }, [userLngLat])

  if (!mapVisible || !hasPoints) return null

  const totalMinutes = routeStats.travelMinutes + routeStats.activityMinutes
  const dayBreakdown = days.map((day, i) => {
    const acts = [day.morning, day.afternoon].filter((a): a is Activity => a !== null)
    const mins = acts.reduce((s, a) => s + parseDuration(a.duration), 0)
    return { dayIndex: i, acts, mins }
  })

  return (
    <div
      id="route-map"
      className="route-map-container"
      style={{
        marginTop: '3rem',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid rgba(52, 211, 153, 0.2)',
        background: 'rgba(5, 20, 12, 0.82)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 80px rgba(52,211,153,0.07), 0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── CSS for user location pulse ── */}
      <style>{`
        @keyframes userPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(99,179,237,0.12), 0 4px 16px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 0 16px rgba(99,179,237,0.05), 0 4px 16px rgba(0,0,0,0.5); }
        }
        .mapboxgl-ctrl-group {
          background: rgba(5,12,8,0.88) !important;
          border: 1px solid rgba(52,211,153,0.2) !important;
          border-radius: 10px !important;
          backdrop-filter: blur(12px) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
          overflow: hidden !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          color: rgba(52,211,153,0.8) !important;
          border-bottom: 1px solid rgba(52,211,153,0.1) !important;
          width: 32px !important;
          height: 32px !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: rgba(52,211,153,0.12) !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1) sepia(1) saturate(2) hue-rotate(100deg) brightness(1.2) !important;
        }
        .mapboxgl-popup-content {
          background: rgba(5,15,10,0.95) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(52,211,153,0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          padding: 8px 12px !important;
          color: #fafaf9 !important;
        }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: rgba(5,15,10,0.95) !important;
        }
        .mapboxgl-popup-close-button {
          color: rgba(255,255,255,0.4) !important;
          font-size: 16px !important;
          line-height: 1 !important;
          right: 6px !important;
          top: 4px !important;
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(5,10,8,0.75) !important;
          border-radius: 8px 0 0 0 !important;
          padding: 2px 8px !important;
          font-size: 10px !important;
          color: rgba(255,255,255,0.3) !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: rgba(52,211,153,0.5) !important;
        }
        .mapboxgl-ctrl-logo {
          filter: brightness(0.4) !important;
          transform: scale(0.75) !important;
          transform-origin: bottom right !important;
        }
        .mapboxgl-ctrl-scale {
          background: rgba(5,10,8,0.7) !important;
          border-color: rgba(52,211,153,0.3) !important;
          color: rgba(255,255,255,0.5) !important;
          font-size: 10px !important;
          border-radius: 0 0 6px 6px !important;
          border-top: none !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div
        className="route-map-header"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: isExpanded ? '1px solid rgba(52,211,153,0.1)' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapIcon size={16} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 style={{
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              fontSize: '1.1rem', fontWeight: 700, lineHeight: 1,
            }}>
              Tu Ruta en Samaipata
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 3 }}>
              {routePoints.length} {routePoints.length === 1 ? 'punto' : 'puntos'} de visita
              {routeStats.distanceKm > 0 && ` · ${routeStats.distanceKm} km`}
              {isCalculating && ' · Calculando...'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {routeStats.distanceKm > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.75rem', borderRadius: 99,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              fontSize: '0.72rem', color: '#34d399',
            }}>
              <Navigation size={11} />
              {routeStats.distanceKm} km
            </div>
          )}
          {totalMinutes > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.75rem', borderRadius: 99,
              background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.2)',
              fontSize: '0.72rem', color: '#d4a574',
            }}>
              <Clock size={11} />
              {formatTime(totalMinutes)}
            </div>
          )}
          <ChevronDown size={16} style={{
            color: 'rgba(255,255,255,0.3)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease', marginLeft: 4,
          }} />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ── Geolocation banner ── */}
          {geoStatus === 'idle' && (
            <div style={{
              padding: '0.85rem 1.5rem',
              borderBottom: '1px solid rgba(52,211,153,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(52,211,153,0.04)',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LocateFixed size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  ¿Querés incluir tu ubicación actual en la ruta?
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); requestGeolocation() }}
                style={{
                  padding: '0.45rem 1rem', borderRadius: 99, fontSize: '0.75rem',
                  fontWeight: 600, background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.35)', color: '#34d399',
                  cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(52,211,153,0.22)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(52,211,153,0.12)' }}
              >
                Activar ubicación
              </button>
            </div>
          )}

          {geoStatus === 'requesting' && (
            <div style={{
              padding: '0.85rem 1.5rem',
              borderBottom: '1px solid rgba(52,211,153,0.08)',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(52,211,153,0.03)',
            }}>
              <Loader2 size={14} style={{ color: '#34d399', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                Solicitando permiso de ubicación…
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {geoStatus === 'granted' && userLngLat && (
            <div style={{
              padding: '0.85rem 1.5rem',
              borderBottom: '1px solid rgba(52,211,153,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(52,211,153,0.04)',
              flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LocateFixed size={14} style={{ color: '#34d399' }} />
                <span style={{ color: '#34d399', fontSize: '0.76rem', fontWeight: 600 }}>
                  Ubicación activa
                </span>
                {routeStats.fromUserKm !== null && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    · ~{routeStats.fromUserKm} km a Samaipata
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); flyToUser() }}
                style={{
                  padding: '0.35rem 0.8rem', borderRadius: 99, fontSize: '0.72rem',
                  fontWeight: 500, background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)', color: '#34d399',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <LocateFixed size={11} /> Centrar
              </button>
            </div>
          )}

          {(geoStatus === 'denied' || geoStatus === 'unavailable') && geoError && (
            <div style={{
              padding: '0.75rem 1.5rem',
              borderBottom: '1px solid rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(245,158,11,0.04)',
              flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <AlertCircle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: 'rgba(245,158,11,0.8)', fontSize: '0.72rem', lineHeight: 1.5 }}>
                  {geoError}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setGeoStatus('idle'); setGeoError(null) }}
                style={{
                  padding: '0.3rem', borderRadius: 6, background: 'transparent',
                  border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* ── Map container ── */}
          {/* data-lenis-prevent: tells Lenis to NOT intercept wheel events here */}
          <div
            style={{ position: 'relative', height: 460 }}
            data-lenis-prevent
            onMouseEnter={() => setShowZoomHint(true)}
            onMouseLeave={() => setShowZoomHint(false)}
          >
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Zoom hint tooltip */}
            {mapReady && (
              <div
                style={{
                  position: 'absolute', bottom: 48, left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 8, pointerEvents: 'none',
                  padding: '5px 14px', borderRadius: 99,
                  background: 'rgba(5,12,8,0.82)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: showZoomHint ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 13 }}>🖱</span>
                Scroll para hacer zoom
              </div>
            )}

            {/* Loading overlay */}
            {!mapReady && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: 'rgba(5,12,8,0.85)', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <Loader2 size={28} style={{ color: '#34d399', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Cargando mapa…
                </span>
              </div>
            )}

            {/* Calculating overlay */}
            {mapReady && isCalculating && (
              <div style={{
                position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.5rem 1rem', borderRadius: 99,
                background: 'rgba(5,12,8,0.88)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(52,211,153,0.2)',
                fontSize: '0.72rem', color: 'var(--text-secondary)',
              }}>
                <Loader2 size={12} style={{ color: '#34d399', animation: 'spin 1s linear infinite' }} />
                Calculando ruta real…
              </div>
            )}

            {/* Day legend */}
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 5,
              display: 'flex', flexDirection: 'column', gap: 5,
              pointerEvents: 'none',
            }}>
              {dayBreakdown.filter((d) => d.acts.length > 0).map(({ dayIndex }) => (
                <div key={dayIndex} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 99,
                  background: 'rgba(5,10,8,0.82)', backdropFilter: 'blur(8px)',
                  border: `1px solid rgba(${dayAccents[dayIndex].rgb},0.3)`,
                  fontSize: '0.68rem', color: dayAccents[dayIndex].color, fontWeight: 600,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: dayAccents[dayIndex].color, flexShrink: 0,
                  }} />
                  {dayAccents[dayIndex].label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats panel ── */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(52,211,153,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
          }}>
            <StatCard
              icon={<Navigation size={13} style={{ color: '#34d399' }} />}
              label="Distancia total"
              value={routeStats.distanceKm > 0 ? `${routeStats.distanceKm}` : '—'}
              unit="km"
              sub={userLngLat ? 'Ruta real en carretera' : 'Desde la base'}
            />
            <StatCard
              icon={<Clock size={13} style={{ color: '#d4a574' }} />}
              label="Tiempo en ruta"
              value={formatTime(routeStats.travelMinutes)}
              sub="Conducción estimada"
            />
            <StatCard
              icon={<MapPin size={13} style={{ color: '#60a5fa' }} />}
              label="En actividades"
              value={formatTime(routeStats.activityMinutes)}
              sub={`${routePoints.length} ${routePoints.length === 1 ? 'actividad' : 'actividades'}`}
            />
            <StatCard
              icon={<Route size={13} style={{ color: '#34d399' }} />}
              label="Experiencia total"
              value={formatTime(totalMinutes)}
              sub="Traslados + actividades"
              highlight
            />
          </div>

          {/* ── Per-day breakdown ── */}
          {dayBreakdown.some((d) => d.acts.length > 0) && (
            <div style={{
              padding: '0.75rem 1.5rem 1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              {dayBreakdown.filter((d) => d.acts.length > 0).map(({ dayIndex, acts, mins }) => (
                <div key={dayIndex} style={{
                  flex: '1 1 180px', padding: '0.75rem', borderRadius: 12,
                  background: `rgba(${dayAccents[dayIndex].rgb},0.05)`,
                  border: `1px solid rgba(${dayAccents[dayIndex].rgb},0.15)`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.12em', color: dayAccents[dayIndex].color,
                    }}>
                      {dayAccents[dayIndex].label}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {formatTime(mins)}
                    </span>
                  </div>
                  {acts.map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: i > 0 ? 4 : 0 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: categoryColors[act.category] ?? '#34d399',
                      }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {act.name}
                        <span style={{ color: 'rgba(255,255,255,0.22)', marginLeft: 4 }}>
                          · {act.duration}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Reusable stat card ──
function StatCard({
  icon, label, value, unit, sub, highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: highlight ? '0.75rem' : undefined,
      background: highlight ? 'rgba(52,211,153,0.05)' : undefined,
      border: highlight ? '1px solid rgba(52,211,153,0.15)' : undefined,
      borderRadius: highlight ? 12 : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
      </div>
      <span style={{
        color: highlight ? '#34d399' : 'var(--text-primary)',
        fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700,
      }}>
        {value}
        {unit && <span style={{ fontSize: '0.78rem', fontWeight: 400, marginLeft: 4, color: 'var(--text-secondary)' }}>{unit}</span>}
      </span>
      {sub && <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{sub}</span>}
    </div>
  )
}
