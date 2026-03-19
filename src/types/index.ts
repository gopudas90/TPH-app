// ─── Employee ─────────────────────────────────────────────
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  name: string;
  photo: string | null;
  designation: string;
  department: string;
  employmentType: 'Full-time' | 'Part-time' | 'Freelance';
  mobile: string;
  email: string;
  whatsapp: string;
  skills: string[];
  certifications: string[];
  dailyRate: number;
  hourlyRate: number;
  overtimeRate: number;
  availability: 'available' | 'on-project' | 'on-leave' | 'unavailable';
  currentProject: string | null;
  reportingTo: string;
  emergencyContact: EmergencyContact;
  joinDate: string;
  totalProjectsCompleted: number;
}

// ─── Customer ─────────────────────────────────────────────
export interface CustomerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface HealthScoreBreakdown {
  engagementFrequency: number;
  revenueTrend: number;
  npsScore: number;
  responsiveness: number;
}

export interface PartnerHealthScoreBreakdown {
  qualityRating: number;
  onTimeDelivery: number;
  costEfficiency: number;
  responsiveness: number;
}

export interface AIRecommendedAction {
  id: string;
  action: string;
  detail: string;
  timing: string;
  priority: 'High' | 'Mid' | 'Low';
  type: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  totalRevenue: number;
  activeDeals: number;
  lastEngagement: string;
  npsScore: number;
  contacts: CustomerContact[];
  preferences: string[];
  healthScore: number;
  healthScoreBreakdown: HealthScoreBreakdown;
  aiRecommendedActions: AIRecommendedAction[];
}

// ─── Partner ──────────────────────────────────────────────
export interface PartnerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface PartnerRates {
  serviceRate: number;
  minimumCharge: number;
  overtimeRate: number;
  deliveryCharge: number;
}

export interface Partner {
  id: string;
  name: string;
  uen: string;
  address: string;
  website: string;
  contacts: PartnerContact[];
  serviceCategories: string[];
  specialisations: string[];
  equipment: string[];
  rates: PartnerRates;
  insurance: boolean;
  insuranceExpiry: string;
  certifications: string[];
  complianceDocuments: string[];
  isPreferred: boolean;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  engagements: number;
  avgRating: number;
  onTimeRate: number;
  totalSpend: number;
  lastEngagement: string;
  healthScore: number;
  healthScoreBreakdown: PartnerHealthScoreBreakdown;
  aiRecommendedActions: AIRecommendedAction[];
}

// ─── Deal / Pipeline ──────────────────────────────────────
export interface PipelineStage {
  id: string;
  name: string;
  color: string;
}

export interface Deal {
  id: string;
  name: string;
  client: string;
  value: number;
  stageId: string;
  type: string;
  date: string;
  owner: string;
  probability: number;
  priority: 'High' | 'Medium' | 'Low';
  leadScore: number;
  leadScoreExplanation: string;
}

// ─── Quote ────────────────────────────────────────────────
export interface QuoteComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface AssignedPartner {
  id: string;
  name: string;
  rate: number;
  status: 'Confirmed' | 'Pending' | 'Awaiting';
  rating: number;
  onTimeRate: number;
  contactName: string;
  phone?: string;
  engagements?: number;
  availability?: string;
  specialisation?: string;
  reason?: string;
}

export interface QuoteLineItem {
  key: string;
  item: string;
  category: string;
  qty: number;
  cost: number;
  unitPrice: number;
  discount: number;
  aiRecommendedPrice: number;
  aiReasoning: string;
  comments: QuoteComment[];
  partner: AssignedPartner | null;
  outsourceable: boolean;
  markup?: number;
}

export interface Quote {
  id: string;
  version: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  client: string;
  eventName: string;
  validUntil: string;
  preparedBy: string;
  targetMargin: number;
  floorMargin: number;
  isAIGenerated: boolean;
}

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
}

export interface InternalNote {
  id: string;
  text: string;
  date: string;
  author: string;
}

// ─── Shared / Notes ───────────────────────────────────────
export interface Note {
  id: string | number;
  text: string;
  date: string;
  author?: string;
}

export interface Document {
  id: string | number;
  name: string;
  date: string;
  size: string;
}
