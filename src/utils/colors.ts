/**
 * Shared color/status mapping utilities.
 * These return Ant Design color names for consistent Tag/Badge coloring.
 */

export const getHealthScoreColor = (score: number): 'success' | 'warning' | 'error' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
};

export const getHealthScoreLabel = (score: number): string => {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Needs Attention';
  return 'At Risk';
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': return 'red';
    case 'Mid': return 'orange';
    case 'Low': return 'green';
    default: return 'default';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Confirmed':
    case 'Completed':
    case 'Paid':
    case 'Approved':
      return 'success';
    case 'Pending':
    case 'In Progress':
    case 'Sent':
      return 'processing';
    case 'Awaiting':
    case 'Draft':
      return 'default';
    default:
      return 'default';
  }
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'Platinum': return 'purple';
    case 'Gold': return 'gold';
    case 'Silver': return 'default';
    case 'Bronze': return 'orange';
    default: return 'default';
  }
};

export const getAvailabilityColor = (status: string): string => {
  switch (status) {
    case 'available': return 'success';
    case 'on-project': return 'processing';
    case 'on-leave': return 'warning';
    case 'unavailable': return 'error';
    default: return 'default';
  }
};

export const getActionTypeColor = (type: string): string => {
  switch (type) {
    case 'Outreach': return 'blue';
    case 'Cost Saving': return 'green';
    case 'Strategic': return 'purple';
    case 'Performance': return 'orange';
    case 'Risk Mitigation': return 'red';
    case 'Relationship': return 'cyan';
    case 'Upsell': return 'gold';
    case 'Retention': return 'volcano';
    default: return 'default';
  }
};
