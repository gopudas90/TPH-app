// @ts-nocheck

export interface AssetSubCategory {
  id: string;
  name: string;
}
export interface AssetCategory {
  id: string;
  name: string;
  subCategories: AssetSubCategory[];
}

export interface AssetCondition {
  id: string;
  name: string;
  color: string;
}

export interface CustomerTier {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface CustomerIndustry {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  name: string;
}
export interface Department {
  id: string;
  name: string;
  designations: Designation[];
}

export const defaultAssetCategories: AssetCategory[] = [
  {
    id: 'ac-1', name: 'AV Equipment',
    subCategories: [
      { id: 'asc-1', name: 'Microphones' },
      { id: 'asc-2', name: 'Speakers & PA Systems' },
      { id: 'asc-3', name: 'Lighting Rigs' },
      { id: 'asc-4', name: 'Projectors & Screens' },
    ],
  },
  {
    id: 'ac-2', name: 'Furniture',
    subCategories: [
      { id: 'asc-5', name: 'Tables' },
      { id: 'asc-6', name: 'Chairs & Seating' },
      { id: 'asc-7', name: 'Staging & Risers' },
    ],
  },
  {
    id: 'ac-3', name: 'Decor',
    subCategories: [
      { id: 'asc-8', name: 'Backdrops & Draping' },
      { id: 'asc-9', name: 'Floral & Centrepieces' },
      { id: 'asc-10', name: 'Signage & Banners' },
    ],
  },
  {
    id: 'ac-4', name: 'Vehicles',
    subCategories: [
      { id: 'asc-11', name: 'Trucks' },
      { id: 'asc-12', name: 'Vans' },
    ],
  },
  {
    id: 'ac-5', name: 'Power & Utilities',
    subCategories: [
      { id: 'asc-13', name: 'Generators' },
      { id: 'asc-14', name: 'Cable & Connectors' },
      { id: 'asc-15', name: 'Distribution Boards' },
    ],
  },
];

export const defaultAssetConditions: AssetCondition[] = [
  { id: 'cond-1', name: 'Excellent', color: 'green' },
  { id: 'cond-2', name: 'Good', color: 'blue' },
  { id: 'cond-3', name: 'Fair', color: 'gold' },
  { id: 'cond-4', name: 'Requires Maintenance', color: 'orange' },
  { id: 'cond-5', name: 'Retired', color: 'default' },
];

export const defaultCustomerTiers: CustomerTier[] = [
  { id: 'tier-1', name: 'Platinum', color: 'purple', description: 'Top-tier clients with the highest spend and long-term engagement.' },
  { id: 'tier-2', name: 'Gold', color: 'gold', description: 'High-value clients with strong repeat business.' },
  { id: 'tier-3', name: 'Silver', color: 'blue', description: 'Mid-tier clients with regular engagement.' },
  { id: 'tier-4', name: 'Bronze', color: 'volcano', description: 'Entry-level clients or new accounts.' },
];

export const defaultCustomerIndustries: CustomerIndustry[] = [
  { id: 'ind-1', name: 'Corporate' },
  { id: 'ind-2', name: 'Entertainment & Media' },
  { id: 'ind-3', name: 'Government & Public Sector' },
  { id: 'ind-4', name: 'Non-Profit & Charity' },
  { id: 'ind-5', name: 'Education' },
  { id: 'ind-6', name: 'Healthcare & Pharma' },
  { id: 'ind-7', name: 'Hospitality & F&B' },
  { id: 'ind-8', name: 'Retail & Lifestyle' },
  { id: 'ind-9', name: 'Finance & Banking' },
  { id: 'ind-10', name: 'Technology' },
];

export const defaultDepartments: Department[] = [
  {
    id: 'dept-1', name: 'Creative',
    designations: [
      { id: 'des-1', name: 'Creative Director' },
      { id: 'des-2', name: 'Art Director' },
      { id: 'des-3', name: 'Graphic Designer' },
      { id: 'des-4', name: 'Content Creator' },
    ],
  },
  {
    id: 'dept-2', name: 'Technical',
    designations: [
      { id: 'des-5', name: 'Technical Director' },
      { id: 'des-6', name: 'AV Technician' },
      { id: 'des-7', name: 'Lighting Technician' },
      { id: 'des-8', name: 'Stage Manager' },
    ],
  },
  {
    id: 'dept-3', name: 'Operations',
    designations: [
      { id: 'des-9', name: 'Operations Manager' },
      { id: 'des-10', name: 'Project Manager' },
      { id: 'des-11', name: 'Event Coordinator' },
      { id: 'des-12', name: 'Logistics Assistant' },
    ],
  },
  {
    id: 'dept-4', name: 'Sales',
    designations: [
      { id: 'des-13', name: 'Sales Director' },
      { id: 'des-14', name: 'Business Development Manager' },
      { id: 'des-15', name: 'Account Manager' },
      { id: 'des-16', name: 'Sales Executive' },
    ],
  },
  {
    id: 'dept-5', name: 'Finance',
    designations: [
      { id: 'des-17', name: 'Finance Manager' },
      { id: 'des-18', name: 'Accountant' },
      { id: 'des-19', name: 'Finance Executive' },
    ],
  },
  {
    id: 'dept-6', name: 'Marketing',
    designations: [
      { id: 'des-20', name: 'Marketing Manager' },
      { id: 'des-21', name: 'Digital Marketing Executive' },
      { id: 'des-22', name: 'Social Media Manager' },
    ],
  },
];

export interface EnquiryType {
  id: string;
  name: string;
}

export interface EventType {
  id: string;
  name: string;
}

export const defaultEnquiryTypes: EnquiryType[] = [
  { id: 'enq-1', name: 'Inbound — Website Form' },
  { id: 'enq-2', name: 'Inbound — Phone Call' },
  { id: 'enq-3', name: 'Inbound — Email' },
  { id: 'enq-4', name: 'Inbound — Referral' },
  { id: 'enq-5', name: 'Outbound — Cold Outreach' },
  { id: 'enq-6', name: 'Outbound — Event Networking' },
  { id: 'enq-7', name: 'Repeat Client' },
  { id: 'enq-8', name: 'RFP / Tender' },
];

export const defaultEventTypes: EventType[] = [
  { id: 'evt-1', name: 'Conference' },
  { id: 'evt-2', name: 'Gala Dinner' },
  { id: 'evt-3', name: 'Product Launch' },
  { id: 'evt-4', name: 'Exhibition / Trade Show' },
  { id: 'evt-5', name: 'Corporate Retreat' },
  { id: 'evt-6', name: 'Roadshow' },
  { id: 'evt-7', name: 'Awards Ceremony' },
  { id: 'evt-8', name: 'Workshop / Seminar' },
  { id: 'evt-9', name: 'Town Hall / AGM' },
  { id: 'evt-10', name: 'Brand Activation' },
  { id: 'evt-11', name: 'Hybrid / Virtual Event' },
  { id: 'evt-12', name: 'Festival / Concert' },
];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
