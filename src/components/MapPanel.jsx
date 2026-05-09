import { useMemo } from 'react'
import styles from './MapPanel.module.css'

function buildOsmEmbedUrl(validMarkers, fitAll) {
  const lats = validMarkers.map((marker) => marker.lat)
  const lngs = validMarkers.map((marker) => marker.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const pad = fitAll ? 0.04 : 0.02
  const swLat = minLat - pad
  const swLng = minLng - pad
  const neLat = maxLat + pad
  const neLng = maxLng + pad

  const markerQuery = validMarkers
    .map((marker) => `&marker=${encodeURIComponent(`${marker.lat},${marker.lng}`)}`)
    .join('')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${swLng}%2C${swLat}%2C${neLng}%2C${neLat}&layer=mapnik${markerQuery}`
}

function MapPanel({ markers = [], fitAll = false }) {
  const validMarkers = useMemo(
    () =>
      markers
        .map((marker) => ({
          ...marker,
          lat: Number(marker.lat),
          lng: Number(marker.lng),
        }))
        .filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng)),
    [markers],
  )

  const embedUrl = useMemo(() => {
    if (!validMarkers.length) return ''
    return buildOsmEmbedUrl(validMarkers, fitAll)
  }, [validMarkers, fitAll])

  if (!validMarkers.length) {
    return (
      <div className={styles.wrap}>
        <div className={styles.fallback}>
          <h3 className={styles.fallbackTitle}>No location data yet</h3>
          <p className={styles.hint}>
            Devices will appear here after they report a GPS fix.
          </p>
          <p className={styles.hint}>
            If you just linked a device, wait for the next upload cycle.
          </p>
        </div>
      </div>
    )
  }

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

export default MapPanel
