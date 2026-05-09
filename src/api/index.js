// API Integration exports - matching API Integration Guide (Frontend)

// Re-export axios client for guide-compatible usage
export { default as api } from './axiosClient'

// Auth API
export * from './authApi'

// Profile API
export * from './profileApi'

// Device API
export * from './deviceApi'

// Location API
export * from './locationApi'

// Stolen Device API
export * from './stolenApi'

// Safety API
export * from './safetyApi'

// Admin API
export * from './adminApi'

// Legacy/Backwards-compatible endpoints
export * from './meApi'
