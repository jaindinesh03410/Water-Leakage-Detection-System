// System Constants for PoleGuardian Smart Water Intelligence System

export const SYSTEM = {
  NAME: 'Smart Water Intelligence System',
  VERSION: '1.0.0',
  DEVICE_PREFIX: 'esp32_'
}

export const HARDWARE = {
  PINS: {
    VIBRATION: 14,
    FLOW: 34
  },
  INTERVALS: {
    DATA_COLLECTION: 5000,
    TRANSMISSION: 5000,
    HEARTBEAT: 30000
  }
}

export const FIREBASE = {
  REGION: 'asia-southeast1',
  NODES: {
    READINGS: '/readings',
    ALERTS: '/alerts',
    ANALYTICS: '/analytics',
    NODES: '/nodes',
    QUALITY: '/quality'
  }
}

export const THEME = {
  COLORS: {
    PRIMARY: '#0b0e14',
    ACCENT_BLUE: '#00d4ff',
    ACCENT_CYAN: '#00ffff',
    ACCENT_PURPLE: '#8b5cf6'
  }
}

export const ALERT_TYPES = {
  LEAK: 'leak',
  THEFT: 'theft',
  PRESSURE: 'pressure',
  TAMPER: 'tamper',
  QUALITY: 'quality'
}

export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const NODE_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

export const QUALITY_RATINGS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
}

export const AI_THRESHOLDS = {
  THEFT_RISK: 75,
  CONTINUOUS_FLOW: 0.05,
  PRESSURE_DROP: 0.1
}