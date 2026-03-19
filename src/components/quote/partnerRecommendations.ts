import type { AssignedPartner } from '../../types';

/**
 * AI-recommended partners for each outsourceable line item.
 * Keyed by line item key.
 */
export type PartnerRecommendation = AssignedPartner & {
  engagements: number;
  availability: string;
  specialisation: string;
  reason: string;
  phone: string;
};

export const AI_PARTNER_RECOMMENDATIONS: Record<string, PartnerRecommendation[]> = {
  '3': [ // Line Array Audio System
    { id: 'P-1001', name: 'SoundWave Audio Pte Ltd', rate: 4500, rating: 4.7, onTimeRate: 96, engagements: 24, contactName: 'Kevin Ong', phone: '+65 9100 1234', availability: 'Available', specialisation: 'Concert Sound, Corporate AV', reason: 'Best match — top-rated AV partner with 24 past engagements. Specialises in concert sound systems. Competitive rate with consistent on-time delivery.', status: 'Pending' },
    { id: 'P-1007', name: 'Vertex Visuals', rate: 5200, rating: 4.6, onTimeRate: 92, engagements: 9, contactName: 'Darren Yeo', phone: '+65 9700 1234', availability: 'Available', specialisation: 'Live Visuals, Media Servers', reason: 'Can bundle AV with video production. Slightly higher rate but includes technical operator.', status: 'Pending' },
    { id: 'P-1006', name: 'PowerGen Rentals', rate: 3800, rating: 4.0, onTimeRate: 85, engagements: 12, contactName: 'Tommy Chua', phone: '+65 9600 1234', availability: 'Limited', specialisation: 'Electrical Distribution, Outdoor Events', reason: 'Lowest cost option. Adequate for basic audio but lower reliability rating. Consider for budget-conscious projects.', status: 'Pending' },
  ],
  '6': [ // Stage Design & Fabrication
    { id: 'P-1005', name: 'QuickBuild Structures', rate: 12500, rating: 4.8, onTimeRate: 95, engagements: 22, contactName: 'James Wee', phone: '+65 9500 1234', availability: 'Available', specialisation: 'Custom Set Design, Exhibition Booths', reason: 'Top scenic fabrication partner with 22 engagements. Highest quality rating for custom sets. Has CNC router and steel fabrication in-house.', status: 'Pending' },
    { id: 'P-1002', name: 'BrightLights Staging Co', rate: 14200, rating: 4.9, onTimeRate: 98, engagements: 31, contactName: 'Daniel Koh', phone: '+65 9200 1234', availability: 'Available', specialisation: 'Stage Construction, LED Wall Installation', reason: 'Premium option with best reliability. Can combine staging + lighting for integrated delivery, but higher rate.', status: 'Pending' },
    { id: 'P-1003', name: 'MoveIt Logistics SG', rate: 9800, rating: 4.2, onTimeRate: 88, engagements: 18, contactName: 'Andy Lim', phone: '+65 9300 1234', availability: 'Available', specialisation: 'Equipment Delivery, Event Bump-In/Out', reason: 'Can handle fabrication logistics and on-site assembly. Lower rate but limited design capability — best paired with in-house design team.', status: 'Pending' },
  ],
  '7': [ // VIP Lounge Furniture Package
    { id: 'P-1004', name: 'GreenLeaf Catering', rate: 7800, rating: 4.5, onTimeRate: 93, engagements: 15, contactName: 'Michelle Tan', phone: '+65 9400 1234', availability: 'Available', specialisation: 'Gala Dinners, Cocktail Receptions', reason: 'Can supply furniture + F&B as a bundled VIP package. Preferred partner with halal certification for diverse guest lists.', status: 'Pending' },
    { id: 'P-1005', name: 'QuickBuild Structures', rate: 8500, rating: 4.8, onTimeRate: 95, engagements: 22, contactName: 'James Wee', phone: '+65 9500 1234', availability: 'Limited', specialisation: 'Pop-Up Structures, Scenic Fabrication', reason: 'Can build custom VIP lounge structures with integrated furniture. Higher quality finish but limited availability for this period.', status: 'Pending' },
    { id: 'P-1003', name: 'MoveIt Logistics SG', rate: 6200, rating: 4.2, onTimeRate: 88, engagements: 18, contactName: 'Andy Lim', phone: '+65 9300 1234', availability: 'Available', specialisation: 'Equipment Delivery, Warehousing', reason: 'Lowest cost — sources furniture from warehouse inventory. Basic but functional. Best for events where VIP furniture is not a focal point.', status: 'Pending' },
  ],
};
