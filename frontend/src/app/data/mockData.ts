export interface Transaction {
  id: string;
  amount: number;
  location: string;
  ipAddress: string;
  riskScore: number;
  confidenceLevel: number;
  status: 'Pending' | 'Escalated' | 'Reviewed';
  timestamp: Date;
  factors: {
    ipAnomaly: number;
    geoMismatch: number;
    velocity: number;
    deviceInconsistency: number;
    amountDeviation: number;
  };
  deviceInfo: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2026-001',
    amount: 8500.00,
    location: 'Lagos, Nigeria',
    ipAddress: '41.203.x.x',
    riskScore: 87,
    confidenceLevel: 92,
    status: 'Escalated',
    timestamp: new Date('2026-03-04T14:23:00'),
    factors: {
      ipAnomaly: 0.85,
      geoMismatch: 0.92,
      velocity: 0.78,
      deviceInconsistency: 0.65,
      amountDeviation: 0.88
    },
    deviceInfo: 'Unknown Device'
  },
  {
    id: 'TXN-2026-002',
    amount: 125.50,
    location: 'New York, USA',
    ipAddress: '192.168.x.x',
    riskScore: 12,
    confidenceLevel: 95,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T14:15:00'),
    factors: {
      ipAnomaly: 0.05,
      geoMismatch: 0.02,
      velocity: 0.15,
      deviceInconsistency: 0.08,
      amountDeviation: 0.12
    },
    deviceInfo: 'iPhone 15 Pro'
  },
  {
    id: 'TXN-2026-003',
    amount: 4200.00,
    location: 'Moscow, Russia',
    ipAddress: '95.108.x.x',
    riskScore: 76,
    confidenceLevel: 48,
    status: 'Pending',
    timestamp: new Date('2026-03-04T14:10:00'),
    factors: {
      ipAnomaly: 0.72,
      geoMismatch: 0.80,
      velocity: 0.55,
      deviceInconsistency: 0.70,
      amountDeviation: 0.65
    },
    deviceInfo: 'Chrome on Windows'
  },
  {
    id: 'TXN-2026-004',
    amount: 2500.00,
    location: 'London, UK',
    ipAddress: '81.2.x.x',
    riskScore: 58,
    confidenceLevel: 62,
    status: 'Pending',
    timestamp: new Date('2026-03-04T14:05:00'),
    factors: {
      ipAnomaly: 0.45,
      geoMismatch: 0.55,
      velocity: 0.68,
      deviceInconsistency: 0.42,
      amountDeviation: 0.60
    },
    deviceInfo: 'Safari on MacBook'
  },
  {
    id: 'TXN-2026-005',
    amount: 89.99,
    location: 'San Francisco, USA',
    ipAddress: '104.28.x.x',
    riskScore: 8,
    confidenceLevel: 88,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T13:58:00'),
    factors: {
      ipAnomaly: 0.03,
      geoMismatch: 0.05,
      velocity: 0.12,
      deviceInconsistency: 0.10,
      amountDeviation: 0.08
    },
    deviceInfo: 'Android Pixel'
  },
  {
    id: 'TXN-2026-006',
    amount: 15000.00,
    location: 'Shanghai, China',
    ipAddress: '180.153.x.x',
    riskScore: 82,
    confidenceLevel: 35,
    status: 'Pending',
    timestamp: new Date('2026-03-04T13:45:00'),
    factors: {
      ipAnomaly: 0.90,
      geoMismatch: 0.88,
      velocity: 0.75,
      deviceInconsistency: 0.82,
      amountDeviation: 0.95
    },
    deviceInfo: 'Unknown Browser'
  },
  {
    id: 'TXN-2026-007',
    amount: 450.00,
    location: 'Chicago, USA',
    ipAddress: '172.58.x.x',
    riskScore: 22,
    confidenceLevel: 78,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T13:30:00'),
    factors: {
      ipAnomaly: 0.18,
      geoMismatch: 0.12,
      velocity: 0.28,
      deviceInconsistency: 0.25,
      amountDeviation: 0.22
    },
    deviceInfo: 'Chrome on Android'
  },
  {
    id: 'TXN-2026-008',
    amount: 6800.00,
    location: 'Dubai, UAE',
    ipAddress: '5.62.x.x',
    riskScore: 68,
    confidenceLevel: 55,
    status: 'Pending',
    timestamp: new Date('2026-03-04T13:20:00'),
    factors: {
      ipAnomaly: 0.62,
      geoMismatch: 0.70,
      velocity: 0.58,
      deviceInconsistency: 0.65,
      amountDeviation: 0.72
    },
    deviceInfo: 'Safari on iPhone'
  }
];

export const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Generate feature-level confidence contributions (0-20% each, totaling ~100%)
    const ipConfidence = Math.floor(Math.random() * 8) + 16; // 16-24%
    const geoConfidence = Math.floor(Math.random() * 8) + 18; // 18-26%
    const velocityConfidence = Math.floor(Math.random() * 8) + 15; // 15-23%
    const deviceConfidence = Math.floor(Math.random() * 8) + 17; // 17-25%
    const amountConfidence = Math.floor(Math.random() * 8) + 16; // 16-24%
    
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      avgRisk: Math.floor(Math.random() * 30) + 25,
      avgConfidence: ipConfidence + geoConfidence + velocityConfidence + deviceConfidence + amountConfidence,
      transactions: Math.floor(Math.random() * 50) + 10,
      // Feature-level confidence contributions
      ipConfidence,
      geoConfidence,
      velocityConfidence,
      deviceConfidence,
      amountConfidence
    });
  }
  
  return data;
};

export const generateScatterData = () => {
  return mockTransactions.map(txn => ({
    risk: txn.riskScore,
    confidence: txn.confidenceLevel,
    amount: txn.amount,
    id: txn.id,
    status: txn.status
  }));
};

export interface RiskWeights {
  ipAnomaly: number;
  geoAnomaly: number;
  velocity: number;
  deviceMismatch: number;
  amountDeviation: number;
}

export const defaultWeights: RiskWeights = {
  ipAnomaly: 0.8,
  geoAnomaly: 0.9,
  velocity: 0.7,
  deviceMismatch: 0.6,
  amountDeviation: 0.75
};
