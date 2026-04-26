import { createContext, useContext, useState, useCallback } from 'react'

const StolenContext = createContext(null)

let nextId = 1

export function StolenProvider({ children }) {
  const [requests, setRequests] = useState([])
  // Set of userId whose device is confirmed stolen (admin approved) — they see alert
  const [approvedStolenUserIds, setApprovedStolenUserIds] = useState(() => new Set())

  const addRequest = useCallback(({ userId, userName, deviceName, cnic }) => {
    const req = {
      id: `req-${nextId++}`,
      userId,
      userName: userName || userId,
      deviceName: deviceName || 'Device',
      cnic: cnic || '',
      requestedAt: new Date().toISOString(),
      status: 'pending',
    }
    setRequests((r) => [req, ...r])
    return req.id
  }, [])

  const approveRequest = useCallback((requestId) => {
    setRequests((r) => {
      const req = r.find((x) => x.id === requestId)
      if (req) setApprovedStolenUserIds((s) => new Set([...s, req.userId]))
      return r.map((req) => (req.id === requestId ? { ...req, status: 'approved' } : req))
    })
  }, [])

  const rejectRequest = useCallback((requestId) => {
    setRequests((r) =>
      r.map((req) => (req.id === requestId ? { ...req, status: 'rejected' } : req))
    )
  }, [])

  const isUserDeviceStolen = useCallback((userId) => approvedStolenUserIds.has(userId), [approvedStolenUserIds])

  return (
    <StolenContext.Provider
      value={{
        requests,
        addRequest,
        approveRequest,
        rejectRequest,
        isUserDeviceStolen,
      }}
    >
      {children}
    </StolenContext.Provider>
  )
}

export function useStolen() {
  const ctx = useContext(StolenContext)
  if (!ctx) throw new Error('useStolen must be used within StolenProvider')
  return ctx
}
