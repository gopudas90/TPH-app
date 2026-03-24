// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Space, Button, theme, Tabs, Input, Select,
  Modal, Form, Switch, Popconfirm, message, Tooltip, Badge, Checkbox, Avatar,
  Collapse, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined,
  SafetyCertificateOutlined, CheckCircleOutlined, LockOutlined, CopyOutlined,
} from '@ant-design/icons';
import {
  defaultRoles, defaultUsers, PERMISSION_MODULES, ALL_PERMISSIONS,
  Role, UserAccount,
} from '../../data/rolesData';
import { MOCK_EMPLOYEES } from '../../data/mockData';

const { Title, Text } = Typography;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const UserManagement: React.FC = () => {
  const { token } = theme.useToken();
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [users, setUsers] = useState<UserAccount[]>(defaultUsers);
  const [activeTab, setActiveTab] = useState('users');

  // ── Role modal ──
  const [roleModal, setRoleModal] = useState<{ open: boolean; editing: Role | null }>({ open: false, editing: null });
  const [roleForm] = Form.useForm();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  // ── User modal ──
  const [userModal, setUserModal] = useState<{ open: boolean; editing: UserAccount | null }>({ open: false, editing: null });
  const [userForm] = Form.useForm();

  // ── Filters ──
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // ── Role CRUD ──
  const openRoleModal = (role?: Role) => {
    setRoleModal({ open: true, editing: role || null });
    setRolePermissions(role?.permissions || []);
    roleForm.setFieldsValue(role ? { name: role.name, description: role.description, color: role.color } : { name: '', description: '', color: 'blue' });
  };

  const saveRole = (vals: any) => {
    if (roleModal.editing) {
      setRoles(prev => prev.map(r => r.id === roleModal.editing!.id ? { ...r, name: vals.name, description: vals.description, color: vals.color, permissions: rolePermissions } : r));
      message.success('Role updated');
    } else {
      setRoles(prev => [...prev, { id: `role-${uid()}`, name: vals.name, description: vals.description, color: vals.color, permissions: rolePermissions, isSystem: false }]);
      message.success('Role created');
    }
    setRoleModal({ open: false, editing: null });
    roleForm.resetFields();
  };

  const deleteRole = (id: string) => {
    const usersWithRole = users.filter(u => u.roleId === id);
    if (usersWithRole.length > 0) { message.error(`Cannot delete — ${usersWithRole.length} user(s) assigned to this role`); return; }
    setRoles(prev => prev.filter(r => r.id !== id));
    message.success('Role deleted');
  };

  const duplicateRole = (role: Role) => {
    const clone = { ...role, id: `role-${uid()}`, name: `${role.name} (Copy)`, isSystem: false, permissions: [...role.permissions] };
    setRoles(prev => [...prev, clone]);
    message.success('Role duplicated');
  };

  const togglePermission = (key: string) => {
    setRolePermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const toggleModuleAll = (modulePerms: string[]) => {
    const allChecked = modulePerms.every(p => rolePermissions.includes(p));
    if (allChecked) {
      setRolePermissions(prev => prev.filter(p => !modulePerms.includes(p)));
    } else {
      setRolePermissions(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  // ── User CRUD ──
  const openUserModal = (user?: UserAccount) => {
    setUserModal({ open: true, editing: user || null });
    userForm.setFieldsValue(user ? { employeeId: user.employeeId, roleId: user.roleId, status: user.status } : { employeeId: '', roleId: '', status: 'Active' });
  };

  const saveUser = (vals: any) => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === vals.employeeId);
    if (!emp) return;
    if (userModal.editing) {
      setUsers(prev => prev.map(u => u.id === userModal.editing!.id ? { ...u, roleId: vals.roleId, status: vals.status } : u));
      message.success('User updated');
    } else {
      if (users.find(u => u.employeeId === vals.employeeId)) { message.error('This employee already has a user account'); return; }
      setUsers(prev => [...prev, { id: `U-${uid()}`, employeeId: vals.employeeId, name: emp.name, email: emp.email, roleId: vals.roleId, status: vals.status, lastLogin: 'Never' }]);
      message.success('User account created');
    }
    setUserModal({ open: false, editing: null });
    userForm.resetFields();
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    message.success('User account removed');
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'All' && u.roleId !== roleFilter) return false;
    if (userSearch && !u.name.toLowerCase().includes(userSearch.toLowerCase()) && !u.email.toLowerCase().includes(userSearch.toLowerCase())) return false;
    return true;
  });

  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown';
  const getRoleColor = (roleId: string) => roles.find(r => r.id === roleId)?.color || 'default';

  const statusColors = { Active: 'success', Inactive: 'default', Suspended: 'error' };

  // ── Users tab columns ──
  const userColumns = [
    {
      title: 'User', key: 'name',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={32} style={{ background: token.colorPrimary }}>{r.name.split(' ').map(n => n[0]).join('')}</Avatar>
          <div>
            <Text strong style={{ fontSize: 13 }}>{r.name}</Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{r.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role', dataIndex: 'roleId', key: 'role', width: 160,
      render: (v: string) => <Tag color={getRoleColor(v)} style={{ margin: 0 }}>{getRoleName(v)}</Tag>,
    },
    {
      title: 'Employee ID', dataIndex: 'employeeId', key: 'employeeId', width: 100,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag>,
    },
    {
      title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin', width: 180,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openUserModal(r)} /></Tooltip>
          <Popconfirm title="Remove this user account?" onConfirm={() => deleteUser(r.id)} okText="Remove" okType="danger">
            <Tooltip title="Remove"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Roles tab columns ──
  const roleColumns = [
    {
      title: 'Role', key: 'name',
      render: (_, r) => (
        <div>
          <Space size={6}>
            <Tag color={r.color} style={{ margin: 0 }}>{r.name}</Tag>
            {r.isSystem && <Tag style={{ fontSize: 10, margin: 0 }}>System</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{r.description}</Text>
        </div>
      ),
    },
    {
      title: 'Permissions', key: 'permissions', width: 120,
      render: (_, r) => <Text style={{ fontSize: 12 }}>{r.permissions.length} / {ALL_PERMISSIONS.length}</Text>,
    },
    {
      title: 'Users', key: 'users', width: 80,
      render: (_, r) => {
        const count = users.filter(u => u.roleId === r.id).length;
        return <Badge count={count} showZero style={{ backgroundColor: count > 0 ? token.colorPrimary : token.colorTextQuaternary }} />;
      },
    },
    {
      title: '', key: 'actions', width: 120,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openRoleModal(r)} /></Tooltip>
          <Tooltip title="Duplicate"><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => duplicateRole(r)} /></Tooltip>
          {!r.isSystem && (
            <Popconfirm title="Delete this role?" onConfirm={() => deleteRole(r.id)} okText="Delete" okType="danger">
              <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Text type="secondary">Manage user accounts, roles, and permission matrix.</Text>
      </div>

      <Card size="small" styles={{ body: { padding: '0 16px 16px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === 'users'
              ? <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openUserModal()}>Add User</Button>
              : <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openRoleModal()}>Create Role</Button>
          }
          items={[
            {
              key: 'users',
              label: <Space size={4}><UserOutlined />Users ({users.length})</Space>,
              children: (
                <>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <Input prefix={<SearchOutlined />} placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} allowClear size="small" style={{ width: 250 }} />
                    <Select value={roleFilter} onChange={setRoleFilter} size="small" style={{ width: 180 }} options={[
                      { value: 'All', label: 'All Roles' },
                      ...roles.map(r => ({ value: r.id, label: r.name })),
                    ]} />
                  </div>
                  <Table dataSource={filteredUsers} columns={userColumns} rowKey="id" size="small" pagination={false} />
                </>
              ),
            },
            {
              key: 'roles',
              label: <Space size={4}><SafetyCertificateOutlined />Roles ({roles.length})</Space>,
              children: (
                <Table dataSource={roles} columns={roleColumns} rowKey="id" size="small" pagination={false} />
              ),
            },
          ]}
        />
      </Card>

      {/* ── Role Modal with Permission Matrix ── */}
      <Modal
        title={roleModal.editing ? 'Edit Role' : 'Create Role'}
        open={roleModal.open}
        onCancel={() => { setRoleModal({ open: false, editing: null }); roleForm.resetFields(); }}
        onOk={() => roleForm.submit()}
        okText={roleModal.editing ? 'Save' : 'Create'}
        width={700}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" onFinish={saveRole} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="name" label="Role Name" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="e.g. Sales Executive" />
            </Form.Item>
            <Form.Item name="color" label="Color" initialValue="blue">
              <Select style={{ width: 100 }} options={[
                { value: 'red', label: <Tag color="red">Red</Tag> },
                { value: 'blue', label: <Tag color="blue">Blue</Tag> },
                { value: 'green', label: <Tag color="green">Green</Tag> },
                { value: 'purple', label: <Tag color="purple">Purple</Tag> },
                { value: 'cyan', label: <Tag color="cyan">Cyan</Tag> },
                { value: 'gold', label: <Tag color="gold">Gold</Tag> },
                { value: 'orange', label: <Tag color="orange">Orange</Tag> },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input placeholder="Brief description of this role's purpose" />
          </Form.Item>
        </Form>

        <Divider style={{ margin: '8px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text strong style={{ fontSize: 14 }}>Permission Matrix</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{rolePermissions.length} / {ALL_PERMISSIONS.length} selected</Text>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Collapse
            size="small"
            defaultActiveKey={PERMISSION_MODULES.map(m => m.module)}
            items={PERMISSION_MODULES.map(mod => {
              const modKeys = mod.permissions.map(p => p.key);
              const checkedCount = modKeys.filter(k => rolePermissions.includes(k)).length;
              const allChecked = checkedCount === modKeys.length;
              const someChecked = checkedCount > 0 && !allChecked;
              return {
                key: mod.module,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onClick={e => { e.stopPropagation(); toggleModuleAll(modKeys); }}
                    />
                    <Text strong style={{ fontSize: 13 }}>{mod.module}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>({checkedCount}/{modKeys.length})</Text>
                  </div>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 24 }}>
                    {mod.permissions.map(p => (
                      <Checkbox
                        key={p.key}
                        checked={rolePermissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                      >
                        <Text style={{ fontSize: 12 }}>{p.label}</Text>
                      </Checkbox>
                    ))}
                  </div>
                ),
              };
            })}
          />
        </div>
      </Modal>

      {/* ── User Modal ── */}
      <Modal
        title={userModal.editing ? 'Edit User' : 'Add User'}
        open={userModal.open}
        onCancel={() => { setUserModal({ open: false, editing: null }); userForm.resetFields(); }}
        onOk={() => userForm.submit()}
        okText={userModal.editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={userForm} layout="vertical" onFinish={saveUser} style={{ marginTop: 16 }}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select
              placeholder="Select employee..."
              showSearch
              optionFilterProp="label"
              disabled={!!userModal.editing}
              options={MOCK_EMPLOYEES.map(e => ({
                value: e.id,
                label: `${e.name} — ${e.designation} (${e.department})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select
              placeholder="Select role..."
              options={roles.map(r => ({
                value: r.id,
                label: <Space size={4}><Tag color={r.color} style={{ margin: 0 }}>{r.name}</Tag><Text type="secondary" style={{ fontSize: 11 }}>{r.permissions.length} permissions</Text></Space>,
              }))}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Suspended', label: 'Suspended' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
