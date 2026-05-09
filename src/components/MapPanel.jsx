import { useMemo } from 'react'
import styles from './MapPanel.module.css'

function buildOsmEmbedUrl(markers, fitAll) {
  const validMarkers = (markers || [])
    .map((m) => ({
      lat: Number(m.lat),
      lng: Number(m.lng),
      id: m.id,
      label: m.label,
      title: m.title,
    }))
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))

  if (!validMarkers.length) {
    // Center on default coords if nothing provided
    return 'https://www.openstreetmap.org/export/embed.html?bbox=-118.5%2C33.9%2C-117.9%2C34.3&layer=mapnik'
  }

  const lats = validMarkers.map((m) => m.lat)
  const lngs = validMarkers.map((m) => m.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const pad = fitAll ? 0.04 : 0.02
  const swLat = minLat - pad
  const swLng = minLng - pad
  const neLat = maxLat + pad
  const neLng = maxLng + pad

  const center = validMarkers[0]
  const markerQuery = `&marker=${encodeURIComponent(center.lat + ',' + center.lng)}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${swLng}%2C${swLat}%2C${neLng}%2C${neLat}&layer=mapnik${markerQuery}`
}

export default function MapPanel({ markers = [], fitAll = false }) {
  const embedUrl = useMemo(() => buildOsmEmbedUrl(markers, fitAll), [markers, fitAll])

  return (
    <div className={styles.wrap}>
      <iframe
        title="Map"
        src={embedUrl}
        className={styles.iframe}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

