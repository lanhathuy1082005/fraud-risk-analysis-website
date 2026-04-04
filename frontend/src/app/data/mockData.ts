export interface Transaction {
  id: string;
  amount: number;
  riskScore: number;
  confidenceLevel: number;
  status: 'Pending' | 'Escalated' | 'Reviewed';
  timestamp: Date;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2026-001',
    amount: 8500.00,
    riskScore: 87,
    confidenceLevel: 92,
    status: 'Escalated',
    timestamp: new Date('2026-03-04T14:23:00'),
  },
  {
    id: 'TXN-2026-002',
    amount: 125.50,
    riskScore: 12,
    confidenceLevel: 95,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T14:15:00'),
  },
  {
    id: 'TXN-2026-003',
    amount: 4200.00,
    riskScore: 76,
    confidenceLevel: 48,
    status: 'Pending',
    timestamp: new Date('2026-03-04T14:10:00'),
  },
  {
    id: 'TXN-2026-004',
    amount: 2500.00,
    riskScore: 58,
    confidenceLevel: 62,
    status: 'Pending',
    timestamp: new Date('2026-03-04T14:05:00'),
  },
  {
    id: 'TXN-2026-005',
    amount: 89.99,
    riskScore: 8,
    confidenceLevel: 88,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T13:58:00'),
  },
  {
    id: 'TXN-2026-006',
    amount: 15000.00,
    riskScore: 82,
    confidenceLevel: 35,
    status: 'Pending',
    timestamp: new Date('2026-03-04T13:45:00'),
  },
  {
    id: 'TXN-2026-007',
    amount: 450.00,
    riskScore: 22,
    confidenceLevel: 78,
    status: 'Reviewed',
    timestamp: new Date('2026-03-04T13:30:00'),
  },
  {
    id: 'TXN-2026-008',
    amount: 6800.00,
    riskScore: 68,
    confidenceLevel: 55,
    status: 'Pending',
    timestamp: new Date('2026-03-04T13:20:00'),
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
