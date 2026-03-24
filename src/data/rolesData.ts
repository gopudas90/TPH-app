// @ts-nocheck

export interface Permission {
  key: string;
  label: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission keys
  isSystem: boolean; // system roles can't be deleted
  color: string;
}

export interface UserAccount {
  id: string;
  employeeId: string; // links to MOCK_EMPLOYEES
  name: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
}

// ── Permission definitions grouped by module ──
export const PERMISSION_MODULES = [
  {
    module: 'Sales',
    permissions: [
      { key: 'sales.dashboard.view', label: 'View dashboard', module: 'Sales' },
      { key: 'sales.pipeline.view', label: 'View pipelines', module: 'Sales' },
      { key: 'sales.pipeline.manage', label: 'Manage pipeline settings', module: 'Sales' },
      { key: 'sales.deals.view', label: 'View deals', module: 'Sales' },
      { key: 'sales.deals.create', label: 'Create deals', module: 'Sales' },
      { key: 'sales.deals.edit', label: 'Edit deals', module: 'Sales' },
      { key: 'sales.deals.delete', label: 'Delete deals', module: 'Sales' },
      { key: 'sales.quotes.view', label: 'View quotes', module: 'Sales' },
      { key: 'sales.quotes.create', label: 'Create / edit quotes', module: 'Sales' },
      { key: 'sales.quotes.approve', label: 'Approve quotes', module: 'Sales' },
    ],
  },
  {
    module: 'Projects',
    permissions: [
      { key: 'projects.dashboard.view', label: 'View dashboard', module: 'Projects' },
      { key: 'projects.view', label: 'View projects', module: 'Projects' },
      { key: 'projects.create', label: 'Create projects', module: 'Projects' },
      { key: 'projects.edit', label: 'Edit projects', module: 'Projects' },
      { key: 'projects.delete', label: 'Delete projects', module: 'Projects' },
      { key: 'projects.tasks.manage', label: 'Manage tasks & milestones', module: 'Projects' },
      { key: 'projects.budget.view', label: 'View budget & financials', module: 'Projects' },
      { key: 'projects.budget.edit', label: 'Edit budget & financials', module: 'Projects' },
    ],
  },
  {
    module: 'Customers',
    permissions: [
      { key: 'customers.view', label: 'View customers', module: 'Customers' },
      { key: 'customers.create', label: 'Create customers', module: 'Customers' },
      { key: 'customers.edit', label: 'Edit customers', module: 'Customers' },
      { key: 'customers.delete', label: 'Delete customers', module: 'Customers' },
    ],
  },
  {
    module: 'Employees',
    permissions: [
      { key: 'employees.view', label: 'View employees', module: 'Employees' },
      { key: 'employees.create', label: 'Create employees', module: 'Employees' },
      { key: 'employees.edit', label: 'Edit employees', module: 'Employees' },
      { key: 'employees.delete', label: 'Delete employees', module: 'Employees' },
      { key: 'employees.rates.view', label: 'View compensation rates', module: 'Employees' },
    ],
  },
  {
    module: 'Partners',
    permissions: [
      { key: 'partners.view', label: 'View partners', module: 'Partners' },
      { key: 'partners.create', label: 'Create partners', module: 'Partners' },
      { key: 'partners.edit', label: 'Edit partners', module: 'Partners' },
      { key: 'partners.delete', label: 'Delete partners', module: 'Partners' },
    ],
  },
  {
    module: 'Assets',
    permissions: [
      { key: 'assets.view', label: 'View assets', module: 'Assets' },
      { key: 'assets.create', label: 'Create assets', module: 'Assets' },
      { key: 'assets.edit', label: 'Edit assets', module: 'Assets' },
      { key: 'assets.delete', label: 'Delete assets', module: 'Assets' },
    ],
  },
  {
    module: 'Administration',
    permissions: [
      { key: 'admin.users.manage', label: 'Manage users & roles', module: 'Administration' },
      { key: 'admin.masterdata.manage', label: 'Manage master data', module: 'Administration' },
      { key: 'admin.settings.manage', label: 'Manage system settings', module: 'Administration' },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap(m => m.permissions);

// ── Default roles ──
export const defaultRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full access to all modules and settings',
    permissions: ALL_PERMISSIONS.map(p => p.key),
    isSystem: true,
    color: 'red',
  },
  {
    id: 'role-sales-director',
    name: 'Sales Director',
    description: 'Full sales access, view-only for other modules',
    permissions: [
      'sales.dashboard.view', 'sales.pipeline.view', 'sales.pipeline.manage',
      'sales.deals.view', 'sales.deals.create', 'sales.deals.edit', 'sales.deals.delete',
      'sales.quotes.view', 'sales.quotes.create', 'sales.quotes.approve',
      'projects.dashboard.view', 'projects.view', 'projects.budget.view',
      'customers.view', 'customers.create', 'customers.edit',
      'employees.view', 'partners.view',
    ],
    isSystem: false,
    color: 'blue',
  },
  {
    id: 'role-sales-exec',
    name: 'Sales Executive',
    description: 'Create and manage own deals and quotes',
    permissions: [
      'sales.dashboard.view', 'sales.pipeline.view',
      'sales.deals.view', 'sales.deals.create', 'sales.deals.edit',
      'sales.quotes.view', 'sales.quotes.create',
      'customers.view', 'customers.create',
      'employees.view', 'partners.view',
    ],
    isSystem: false,
    color: 'cyan',
  },
  {
    id: 'role-project-manager',
    name: 'Project Manager',
    description: 'Full project access with budget visibility',
    permissions: [
      'projects.dashboard.view', 'projects.view', 'projects.create', 'projects.edit',
      'projects.tasks.manage', 'projects.budget.view', 'projects.budget.edit',
      'sales.dashboard.view', 'sales.deals.view', 'sales.quotes.view',
      'customers.view', 'employees.view', 'employees.rates.view',
      'partners.view', 'assets.view',
    ],
    isSystem: false,
    color: 'purple',
  },
  {
    id: 'role-technician',
    name: 'Technician',
    description: 'View assigned projects and tasks',
    permissions: [
      'projects.view', 'projects.tasks.manage',
      'assets.view', 'employees.view',
    ],
    isSystem: false,
    color: 'green',
  },
  {
    id: 'role-finance',
    name: 'Finance',
    description: 'Budget and financial access across modules',
    permissions: [
      'sales.dashboard.view', 'sales.deals.view', 'sales.quotes.view', 'sales.quotes.approve',
      'projects.dashboard.view', 'projects.view', 'projects.budget.view', 'projects.budget.edit',
      'customers.view', 'employees.view', 'employees.rates.view',
      'partners.view', 'assets.view',
    ],
    isSystem: false,
    color: 'gold',
  },
];

// ── Default user accounts (linked to employees) ──
export const defaultUsers: UserAccount[] = [
  { id: 'U-001', employeeId: 'E-1002', name: 'Diana Lim', email: 'diana.lim@tph.sg', roleId: 'role-admin', status: 'Active', lastLogin: '2026-03-24 09:15 AM' },
  { id: 'U-002', employeeId: 'E-1004', name: 'Sarah Jenkins', email: 'sarah.jenkins@tph.sg', roleId: 'role-sales-director', status: 'Active', lastLogin: '2026-03-24 08:30 AM' },
  { id: 'U-003', employeeId: 'E-1006', name: 'Jason Tan', email: 'jason.tan@tph.sg', roleId: 'role-project-manager', status: 'Active', lastLogin: '2026-03-23 05:00 PM' },
  { id: 'U-004', employeeId: 'E-1001', name: 'Ahmad Razak', email: 'ahmad.razak@tph.sg', roleId: 'role-technician', status: 'Active', lastLogin: '2026-03-22 04:30 PM' },
  { id: 'U-005', employeeId: 'E-1003', name: 'Rajan Pillai', email: 'rajan.pillai@tph.sg', roleId: 'role-technician', status: 'Active', lastLogin: '2026-03-23 10:00 AM' },
  { id: 'U-006', employeeId: 'E-1005', name: 'Priya Sharma', email: 'priya.sharma@tph.sg', roleId: 'role-sales-exec', status: 'Active', lastLogin: '2026-03-24 07:45 AM' },
  { id: 'U-007', employeeId: 'E-1007', name: 'Marcus Lee', email: 'marcus.lee@tph.sg', roleId: 'role-finance', status: 'Active', lastLogin: '2026-03-21 03:00 PM' },
  { id: 'U-008', employeeId: 'E-1008', name: 'Li Wei Chen', email: 'liwei.chen@tph.sg', roleId: 'role-project-manager', status: 'Inactive', lastLogin: '2026-02-15 11:00 AM' },
];
