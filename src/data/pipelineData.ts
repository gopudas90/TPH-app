// @ts-nocheck

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  checklist: ChecklistItem[];
}

export interface PipelineConfig {
  id: string;
  name: string;
  typeKey: string; // matches deal.type
  stages: PipelineStage[];
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: '1', name: 'Inquiry Received', description: 'Initial client contact logged',
    checklist: [],
  },
  {
    id: '2', name: 'Qualification', description: 'Event details gathered',
    checklist: [
      { id: 'cl-2a', label: 'Client budget range confirmed', required: true },
      { id: 'cl-2b', label: 'Event date / tentative date range identified', required: true },
      { id: 'cl-2c', label: 'Key decision-maker identified', required: false },
      { id: 'cl-2d', label: 'Event type and format clarified', required: false },
      { id: 'cl-2e', label: 'Venue preferences discussed', required: false },
    ],
  },
  {
    id: '3', name: 'Concept & Scope', description: 'Event concept developed',
    checklist: [
      { id: 'cl-3a', label: 'Client brief received and reviewed', required: true },
      { id: 'cl-3b', label: 'Site visit completed or scheduled', required: false },
      { id: 'cl-3c', label: 'Creative concept drafted', required: true },
      { id: 'cl-3d', label: 'Technical requirements assessed', required: false },
      { id: 'cl-3e', label: 'Resource availability checked', required: false },
    ],
  },
  {
    id: '4', name: 'Proposal Development', description: 'Quote / proposal built',
    checklist: [
      { id: 'cl-4a', label: 'Scope of work finalized', required: true },
      { id: 'cl-4b', label: 'Vendor / partner quotes collected', required: true },
      { id: 'cl-4c', label: 'Budget breakdown prepared', required: false },
      { id: 'cl-4d', label: 'Timeline / run-of-show drafted', required: false },
      { id: 'cl-4e', label: 'Risk assessment completed', required: false },
    ],
  },
  {
    id: '5', name: 'Proposal Submitted', description: 'Sent to client',
    checklist: [
      { id: 'cl-5a', label: 'Proposal reviewed internally', required: true },
      { id: 'cl-5b', label: 'Pricing approved by manager', required: true },
      { id: 'cl-5c', label: 'Client presentation / walkthrough scheduled', required: false },
      { id: 'cl-5d', label: 'Proposal document formatted and branded', required: false },
    ],
  },
  {
    id: '6', name: 'Negotiation', description: 'Client feedback received',
    checklist: [
      { id: 'cl-6a', label: 'Client feedback documented', required: true },
      { id: 'cl-6b', label: 'Revised terms / scope prepared', required: false },
      { id: 'cl-6c', label: 'Discount limits confirmed with management', required: false },
      { id: 'cl-6d', label: 'Alternative options prepared if needed', required: false },
    ],
  },
  {
    id: '7', name: 'Awaiting Approval', description: 'Pending e-signature',
    checklist: [
      { id: 'cl-7a', label: 'Final proposal sent to client', required: true },
      { id: 'cl-7b', label: 'Contract terms agreed upon', required: true },
      { id: 'cl-7c', label: 'Payment terms and milestones confirmed', required: false },
      { id: 'cl-7d', label: 'Internal team notified of pending confirmation', required: false },
    ],
  },
  {
    id: '8', name: 'Won / Confirmed', description: 'Converted to project',
    checklist: [
      { id: 'cl-8a', label: 'Contract / LPO signed by client', required: true },
      { id: 'cl-8b', label: 'Deposit invoice sent', required: true },
      { id: 'cl-8c', label: 'Project kickoff meeting scheduled', required: false },
      { id: 'cl-8d', label: 'Project created in system', required: false },
      { id: 'cl-8e', label: 'Account manager assigned', required: false },
    ],
  },
  {
    id: '9', name: 'Lost / No-Go', description: 'Deal closed without conversion',
    checklist: [
      { id: 'cl-9a', label: 'Loss reason documented', required: true },
      { id: 'cl-9b', label: 'Client feedback collected', required: false },
      { id: 'cl-9c', label: 'Follow-up / re-engagement date set', required: false },
      { id: 'cl-9d', label: 'Lessons learned shared with team', required: false },
    ],
  },
];

// Deep-clone stages — keep original stage IDs so MOCK_DEALS stageId references still match
const cloneStages = (pipelinePrefix: string): PipelineStage[] =>
  JSON.parse(JSON.stringify(DEFAULT_STAGES)).map((s: PipelineStage) => ({
    ...s,
    checklist: s.checklist.map((c: ChecklistItem) => ({ ...c, id: `${c.id}-${pipelinePrefix}` })),
  }));

export const defaultPipelines: PipelineConfig[] = [
  { id: 'pipe-1', name: 'Corporate Events Pipeline', typeKey: 'Corporate Events', stages: cloneStages('p1') },
  { id: 'pipe-2', name: 'Experiential Activations Pipeline', typeKey: 'Experiential Activations', stages: cloneStages('p2') },
  { id: 'pipe-3', name: 'Exhibitions & Trade Shows Pipeline', typeKey: 'Exhibitions & Trade Shows', stages: cloneStages('p3') },
  { id: 'pipe-4', name: 'Roadshows & Touring Pipeline', typeKey: 'Roadshows & Touring', stages: cloneStages('p4') },
  { id: 'pipe-5', name: 'Retainer / Framework Agreement Pipeline', typeKey: 'Retainer / Framework Agreement', stages: cloneStages('p5') },
];
