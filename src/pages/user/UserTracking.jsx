import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMyDevices } from '../../api/deviceApi'
import {
  deleteDeviceLink,
  getTrackedDevices,
  getTrackers,
  updateDeviceLinkPermission,
} from '../../api/deviceLinkApi'
import { getMyLocations, getDeviceLocation } from '../../api/locationApi'
import MapPanel from '../../components/MapPanel'
import styles from '../DeviceLocation.module.css'

const STATUS_TONE = {
  ACTIVE: 'ok',
  ONLINE: 'ok',
  LOST: 'warn',
  DISABLED: 'muted',
  OFFLINE: 'muted',
}

function formatTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function formatCoords(location) {
  if (!location) return '—'
  const lat = Number(location.latitude)
  const lng = Number(location.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '—'
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function resolveDeviceName(device) {
  if (!device) return 'Device'
  if (device.deviceName) return device.deviceName
  if (device.name) return device.name
  if (device.peerId) return device.peerId
  if (device.deviceId != null) return `Device ${device.deviceId}`
  return 'Device'
}

function resolveOwnerName(owner) {
  if (!owner) return 'Owner'
  return owner.username || owner.email || (owner.userId != null ? `User ${owner.userId}` : 'Owner')
}

function statusTone(status) {
  const key = String(status || '').toUpperCase()
  return STATUS_TONE[key] || 'muted'
}

export default function UserTracking() {
  const { user } = useAuth()
  const token = user?.accessToken

  const [myDevices, setMyDevices] = useState([])
  const [trackedLinks, setTrackedLinks] = useState([])
  const [trackerLinks, setTrackerLinks] = useState([])
  const [locationsByDeviceId, setLocationsByDeviceId] = useState({})
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)

  const [myDevicesLoading, setMyDevicesLoading] = useState(false)
  const [myDevicesError, setMyDevicesError] = useState('')
  const [trackedLoading, setTrackedLoading] = useState(false)
  const [trackedError, setTrackedError] = useState('')
  const [trackersLoading, setTrackersLoading] = useState(false)
  const [trackersError, setTrackersError] = useState('')
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationsError, setLocationsError] = useState('')

  const loadDeviceLinks = async (cancelledRef) => {
    setTrackedLoading(true)
    setTrackedError('')
    setTrackersLoading(true)
    setTrackersError('')

    const [trackedRes, trackersRes] = await Promise.all([
      getTrackedDevices(token),
      getTrackers(token),
    ])

    if (cancelledRef?.cancelled) return { trackedRes, trackersRes, cancelled: true }

    if (trackedRes.ok) {
      setTrackedLinks(Array.isArray(trackedRes.data) ? trackedRes.data : [])
    } else {
      setTrackedLinks([])
      setTrackedError(trackedRes.error || 'Failed to load tracked devices')
    }

    if (trackersRes.ok) {
      setTrackerLinks(Array.isArray(trackersRes.data) ? trackersRes.data : [])
    } else {
      setTrackerLinks([])
      setTrackersError(trackersRes.error || 'Failed to load trackers')
    }

    setTrackedLoading(false)
    setTrackersLoading(false)
    return { trackedRes, trackersRes, cancelled: false }
  }

  useEffect(() => {
    if (!token) return
    const cancelledRef = { cancelled: false }

    const load = async () => {
      setMyDevicesLoading(true)
      setMyDevicesError('')
      setLocationsLoading(true)
      setLocationsError('')

      const [devicesRes, linksResult, myLocationsRes] = await Promise.all([
        getMyDevices(token),
        loadDeviceLinks(cancelledRef),
        getMyLocations(token),
      ])

      if (cancelledRef.cancelled || linksResult?.cancelled) return
      const trackedRes = linksResult.trackedRes

      if (devicesRes.ok) {
        setMyDevices(Array.isArray(devicesRes.data) ? devicesRes.data : [])
      } else {
        setMyDevices([])
        setMyDevicesError(devicesRes.error || 'Failed to load devices')
      }

      const locationMap = {}
      let locationError = ''

      if (myLocationsRes.ok) {
        myLocationsRes.data.forEach((loc) => {
          if (loc?.subjectDeviceId != null) {
            locationMap[loc.subjectDeviceId] = loc
          }
        })
      } else {
        locationError = myLocationsRes.error || 'Failed to load device locations'
      }

      if (trackedRes.ok) {
        const trackedIds = Array.from(
          new Set(
            (trackedRes.data || [])
              .map((link) => link?.device?.deviceId)
              .filter((id) => id != null),
          ),
        )

        if (trackedIds.length) {
          const trackedResults = await Promise.all(
            trackedIds.map((id) => getDeviceLocation(token, id)),
          )

          if (cancelledRef.cancelled) return

          trackedResults.forEach((result) => {
            if (result.ok && result.data?.subjectDeviceId != null) {
              locationMap[result.data.subjectDeviceId] = result.data
            }
          })

          if (!locationError) {
            const failed = trackedResults.find((result) => !result.ok)
            if (failed) {
              locationError = failed.error || 'Some tracked locations could not be loaded'
            }
          }
        }
      }

      if (cancelledRef.cancelled) return

      setLocationsByDeviceId(locationMap)
      setLocationsError(locationError)
      setMyDevicesLoading(false)
      setLocationsLoading(false)
    }

    load()

    return () => {
      cancelledRef.cancelled = true
    }
  }, [token])

  const ownedItems = useMemo(
    () =>
      myDevices.map((device) => ({
        deviceId: device.deviceId,
        name: resolveDeviceName(device),
        peerId: device.peerId,
        status: device.status,
        lastSeenAt: device.lastSeenAt,
        location: locationsByDeviceId[device.deviceId],
        kind: 'owned',
      })),
    [myDevices, locationsByDeviceId],
  )

  const trackedItems = useMemo(
    () =>
      trackedLinks.map((link) => ({
        deviceId: link?.device?.deviceId,
        name: resolveDeviceName(link?.device),
        peerId: link?.device?.peerId,
        status: link?.device?.status,
        lastSeenAt: link?.device?.lastSeenAt,
        location: locationsByDeviceId[link?.device?.deviceId],
        ownerName: resolveOwnerName(link?.owner),
        permission: link?.permissionType,
        linkId: link?.linkId,
        kind: 'tracked',
      })),
    [trackedLinks, locationsByDeviceId],
  )

  const allItems = useMemo(() => [...ownedItems, ...trackedItems], [ownedItems, trackedItems])

  const selectedItem = useMemo(() => {
    if (!allItems.length) return null
    if (selectedDeviceId != null) {
      return allItems.find((item) => item.deviceId === selectedDeviceId) || allItems[0]
    }
    return allItems[0]
  }, [allItems, selectedDeviceId])

  useEffect(() => {
    if (!allItems.length) {
      setSelectedDeviceId(null)
      return
    }
    if (selectedDeviceId == null) {
      if (allItems[0].deviceId != null) {
        setSelectedDeviceId(allItems[0].deviceId)
      }
      return
    }
    const stillExists = allItems.some((item) => item.deviceId === selectedDeviceId)
    if (!stillExists) {
      if (allItems[0].deviceId != null) {
        setSelectedDeviceId(allItems[0].deviceId)
      }
    }
  }, [allItems, selectedDeviceId])

  const markers = useMemo(() => {
    const visible = allItems
      .map((item) => {
        const lat = Number(item?.location?.latitude)
        const lng = Number(item?.location?.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return {
          id: item.deviceId,
          lat,
          lng,
          label: item.name,
        }
      })
      .filter(Boolean)

    if (!selectedItem) return visible
    return visible.sort((a, b) => (a.id === selectedItem.deviceId ? -1 : b.id === selectedItem.deviceId ? 1 : 0))
  }, [allItems, selectedItem])

  const selectedLocation = selectedItem?.location
  const lastUpdate = formatTimestamp(selectedLocation?.recordedAt || selectedItem?.lastSeenAt)
  const coordText = formatCoords(selectedLocation)
  const ownerLabel = selectedItem?.kind === 'tracked'
    ? selectedItem.ownerName
    : user?.username || user?.name || 'You'

  const handlePermissionChange = async (linkId, permissionType) => {
    if (!token || !linkId) return
    setTrackedError('')
    const result = await updateDeviceLinkPermission(token, linkId, permissionType)
    if (result.ok) {
      setTrackedLinks((links) =>
        links.map((link) => (link.linkId === linkId ? result.data || { ...link, permissionType } : link)),
      )
    } else {
      setTrackedError(result.error || 'Failed to update permission')
    }
  }

  const handleDeleteLink = async (linkId) => {
    if (!token || !linkId) return
    setTrackedError('')
    const result = await deleteDeviceLink(token, linkId)
    if (result.ok) {
      setTrackedLinks((links) => links.filter((link) => link.linkId !== linkId))
    } else {
      setTrackedError(result.error || 'Failed to remove device link')
    }
  }

  const renderDeviceList = (items, { loading, error, emptyMessage }) => {
    if (loading) return <p className={styles.listMessage}>Loading...</p>
    if (error) return <p className={styles.listError}>{error}</p>
    if (!items.length) return <p className={styles.listMessage}>{emptyMessage}</p>
    return (
      <ul className={styles.deviceList}>
        {items.map((item) => {
          const active = selectedItem?.deviceId === item.deviceId
          const tone = statusTone(item.status)
          const statusClass = styles[`status${tone}`] || styles.statusmuted
          const coords = formatCoords(item.location)
          const hasCoords = coords !== '—'
          return (
            <li
              key={`${item.kind}-${item.deviceId || item.name}`}
              className={`${styles.deviceItem} ${active ? styles.deviceItemActive : ''}`}
            >
              <button
                type="button"
                className={styles.deviceButton}
                onClick={() => item.deviceId != null && setSelectedDeviceId(item.deviceId)}
              >
                <div className={styles.deviceRow}>
                  <span className={styles.deviceName}>{item.name}</span>
                  <span className={`${styles.statusDot} ${statusClass}`} aria-label={item.status || 'unknown'} />
                </div>
                <div className={styles.deviceMeta}>
                  {item.kind === 'tracked' && item.ownerName && (
                    <span>Owner: {item.ownerName}</span>
                  )}
                  {item.peerId && <span>Peer: {item.peerId.slice(0, 10)}</span>}
                  {item.permission && (
                    <span className={styles.permissionChip}>{item.permission}</span>
                  )}
                </div>
                <div className={styles.deviceSub}>
                  {hasCoords ? `Coords: ${coords}` : 'No location fix yet'}
                </div>
              </button>
              {item.kind === 'tracked' && item.linkId && (
                <div className={styles.deviceActions}>
                  <select
                    className={styles.permissionSelect}
                    value={item.permission || 'TRACK'}
                    onChange={(event) => handlePermissionChange(item.linkId, event.target.value)}
                  >
                    <option value="TRACK">TRACK</option>
                    <option value="VIEW">VIEW</option>
                  </select>
                  <button
                    type="button"
                    className={styles.unlinkAction}
                    onClick={() => handleDeleteLink(item.linkId)}
                  >
                    Unlink
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <p className={styles.heroMeta}>Tracking Dashboard</p>
          <h1 className={styles.heroTitle}>Live Device Map</h1>
          <p className={styles.heroSubtitle}>
            Monitor your devices and the ones shared with you. Select a device to focus the map and see its latest
            location update.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Active device</span>
            <span className={styles.summaryValue}>{selectedItem?.name || '—'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Owner</span>
            <span className={styles.summaryValue}>{ownerLabel}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Last update</span>
            <span className={styles.summaryValue}>{lastUpdate}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Permission</span>
            <span className={styles.summaryValue}>{selectedItem?.permission || 'Owner'}</span>
          </div>
        </div>
      </div>

      <section className={styles.dashboard}>
        <div className={styles.mapCard}>
          <div className={styles.mapHeader}>
            <div>
              <h2 className={styles.mapTitle}>Live Location</h2>
              <p className={styles.mapMeta}>
                {locationsLoading
                  ? 'Syncing locations...'
                  : selectedLocation
                    ? `Updated ${lastUpdate}`
                    : 'Waiting for first GPS fix'}
              </p>
              {locationsError && <p className={styles.mapMeta}>{locationsError}</p>}
            </div>
            <div className={styles.mapBadges}>
              {selectedItem?.kind === 'tracked' ? (
                <>
                  <span className={`${styles.badge} ${styles.badgeTrack}`}>Tracked</span>
                  {selectedItem.permission && <span className={styles.badge}>{selectedItem.permission}</span>}
                </>
              ) : (
                <span className={`${styles.badge} ${styles.badgeOwn}`}>Owned</span>
              )}
            </div>
          </div>

          <MapPanel markers={markers} fitAll={markers.length > 1} />

          <div className={styles.mapFooter}>
            <div>
              <div className={styles.footerLabel}>Coordinates</div>
              <div className={styles.footerValue}>{coordText}</div>
            </div>
            <div>
              <div className={styles.footerLabel}>Last update</div>
              <div className={styles.footerValue}>{lastUpdate}</div>
            </div>
            <div>
              <div className={styles.footerLabel}>Device</div>
              <div className={styles.footerValue}>
                {selectedItem?.peerId || selectedItem?.deviceId || '—'}
              </div>
            </div>
          </div>
        </div>

        <aside className={styles.rosterPanel}>
          <div className={styles.rosterSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>My Devices</h3>
              <span className={styles.sectionCount}>{myDevices.length}</span>
            </div>
            <p className={styles.sectionHint}>Devices registered to your account.</p>
            {renderDeviceList(ownedItems, {
              loading: myDevicesLoading,
              error: myDevicesError,
              emptyMessage: 'No registered devices yet.',
            })}
          </div>

          <div className={styles.rosterDivider} />

          <div className={styles.rosterSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Tracked Devices</h3>
              <span className={styles.sectionCount}>{trackedItems.length}</span>
            </div>
            <p className={styles.sectionHint}>Devices shared with you via tracking links.</p>
            {renderDeviceList(trackedItems, {
              loading: trackedLoading,
              error: trackedError,
              emptyMessage: 'No tracked devices yet.',
            })}
          </div>

          <div className={styles.rosterSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Trackers</h3>
              <span className={styles.sectionCount}>{trackerLinks.length}</span>
            </div>
            <p className={styles.sectionHint}>Users who can track your devices.</p>
            {trackersLoading ? (
              <p className={styles.listMessage}>Loading...</p>
            ) : trackersError ? (
              <p className={styles.listError}>{trackersError}</p>
            ) : trackerLinks.length ? (
              <ul className={styles.deviceList}>
                {trackerLinks.map((link) => (
                  <li key={link.linkId} className={styles.deviceItem}>
                    <div className={styles.trackerCard}>
                      <div className={styles.deviceRow}>
                        <span className={styles.deviceName}>
                          {link.follower?.username || link.follower?.email || 'User'}
                        </span>
                        <span className={styles.permissionChip}>{link.permissionType}</span>
                      </div>
                      <div className={styles.deviceMeta}>
                        <span>{resolveDeviceName(link.targetDevice)}</span>
                        {link.targetDevice?.peerId && <span>Peer: {link.targetDevice.peerId.slice(0, 10)}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.listMessage}>No trackers yet.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
