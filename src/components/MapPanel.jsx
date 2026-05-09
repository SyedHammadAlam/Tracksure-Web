import { useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import styles from './MapPanel.module.css'

const defaultCenter = { lat: 34.0522, lng: -118.2437 }

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '320px',
}

const mapOptions = {
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#39ff14' }] },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2a2a2a' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0d1a0d' }],
    },
  ],
}

function MapInner({ markers, fitAll }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'tracksure-google-map',
    googleMapsApiKey: apiKey,
  })

  const center = useMemo(() => {
    if (!markers.length) return defaultCenter
    return { lat: Number(markers[0].lat), lng: Number(markers[0].lng) }
  }, [markers])

  const onLoad = useCallback(
    (m) => {
      if (!markers.length || typeof window.google === 'undefined') return
      if (fitAll && markers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds()
        markers.forEach((x) =>
          bounds.extend({ lat: Number(x.lat), lng: Number(x.lng) }),
        )
        m.fitBounds(bounds, 56)
        return
      }
      const first = markers[0]
      m.setCenter({ lat: Number(first.lat), lng: Number(first.lng) })
      m.setZoom(14)
    },
    [markers, fitAll],
  )

  if (loadError) {
    return (
      <div className={styles.fallback}>
        <p>Could not load Google Maps. Check your API key and billing.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return <div className={styles.fallback}>Loading map…</div>
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={fitAll && markers.length > 1 ? 4 : 14}
      onLoad={onLoad}
      options={mapOptions}
    >
      {markers.map((m) => (
        <MarkerF
          key={m.id}
          position={{ lat: Number(m.lat), lng: Number(m.lng) }}
          title={m.title || m.id}
          label={
            m.label
              ? {
                  text: m.label,
                  color: '#39FF14',
                  fontSize: '11px',
                  fontWeight: '600',
                }
              : undefined
          }
        />
      ))}
    </GoogleMap>
  )
}

/**
 * @param {{ id: string, lat: number, lng: number, label?: string, title?: string }[]} markers
 * @param {boolean} fitAll - fit bounds for admin (all users); single-user view centers one marker
 */
export default function MapPanel({ markers = [], fitAll = false }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className={styles.fallback}>
        <p className={styles.fallbackTitle}>Google Maps API key missing</p>
        <p>
          Create a file <code className={styles.code}>.env</code> in the project root with:
        </p>
        <pre className={styles.pre}>VITE_GOOGLE_MAPS_API_KEY=your_key_here</pre>
        <p className={styles.hint}>
          Enable the Maps JavaScript API for that key in Google Cloud Console.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <MapInner markers={markers} fitAll={fitAll} key={JSON.stringify(markers)} />
    </div>
  )
}
