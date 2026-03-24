// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Space, Button, theme, Input, Select,
  Modal, Form, Popconfirm, message, Tooltip, Badge, Checkbox, Avatar, Switch,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  SafetyCertificateOutlined, CopyOutlined,
} from '@ant-design/icons';
import { defaultRoles, defaultUsers, Role } from '../../data/rolesData';

const { Title, Text } = Typography;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Module list for the CRUD permission table
const MODULES = [
  'Sales', 'Projects', 'Customers', 'Employees', 'Partners', 'Assets', 'Master Data', 'Reports',
];

export const UserManagement: React.FC = () => {
  const { token } = theme.useToken();
  const [roles, setRoles] = useState<Role[]>(() =>
    defaultRoles.map(r => ({
      ...r,
      // Convert existing permission keys into a simple CRUD map per module
      crud: MODULES.reduce((acc, mod) => {
        const modKey = mod.toLowerCase().replace(/ /g, '');
        acc[mod] = {
          create: r.permissions.some(p => p.includes(`${modKey}.create`) || p.includes('admin.')),
          read: r.permissions.some(p => p.includes(`${modKey}.view`) || p.includes(`${modKey}.dashboard`) || p.includes('admin.')),
          edit: r.permissions.some(p => p.includes(`${modKey}.edit`) || p.includes(`${modKey}.manage`) || p.includes('admin.')),
          delete: r.permissions.some(p => p.includes(`${modKey}.delete`) || p.includes('admin.')),
        };
        return acc;
      }, {} as Record<string, { create: boolean; read: boolean; edit: boolean; delete: boolean }>),
    }))
  );
  const [search, setSearch] = useState('');
  const [roleModal, setRoleModal] = useState<{ open: boolean; editing: any | null }>({ open: false, editing: null });
  const [roleForm] = Form.useForm();
  const [editCrud, setEditCrud] = useState<Record<string, { create: boolean; read: boolean; edit: boolean; delete: boolean }>>({});

  const users = defaultUsers;
  const getUserCount = (roleId: string) => users.filter(u => u.roleId === roleId).length;

  // ── Open modal ──
  const openRoleModal = (role?: any) => {
    setRoleModal({ open: true, editing: role || null });
    roleForm.setFieldsValue(role ? { name: role.name, description: role.description, color: role.color } : { name: '', description: '', color: 'blue' });
    setEditCrud(role?.crud || MODULES.reduce((acc, mod) => { acc[mod] = { create: false, read: false, edit: false, delete: false }; return acc; }, {}));
  };

  const saveRole = (vals: any) => {
    if (roleModal.editing) {
      setRoles(prev => prev.map(r => r.id === roleModal.editing.id ? { ...r, name: vals.name, description: vals.description, color: vals.color, crud: { ...editCrud } } : r));
      message.success('Role updated');
    } else {
      setRoles(prev => [...prev, { id: `role-${uid()}`, name: vals.name, description: vals.description, color: vals.color, permissions: [], isSystem: false, crud: { ...editCrud } }]);
      message.success('Role created');
    }
    setRoleModal({ open: false, editing: null });
    roleForm.resetFields();
  };

  const deleteRole = (id: string) => {
    const count = getUserCount(id);
    if (count > 0) { message.error(`Cannot delete — ${count} user(s) assigned`); return; }
    setRoles(prev => prev.filter(r => r.id !== id));
    message.success('Role deleted');
  };

  const duplicateRole = (role: any) => {
    const clone = { ...role, id: `role-${uid()}`, name: `${role.name} (Copy)`, isSystem: false, crud: JSON.parse(JSON.stringify(role.crud)) };
    setRoles(prev => [...prev, clone]);
    message.success('Role duplicated');
  };

  const toggleCrud = (mod: string, action: 'create' | 'read' | 'edit' | 'delete') => {
    setEditCrud(prev => ({ ...prev, [mod]: { ...prev[mod], [action]: !prev[mod][action] } }));
  };

  const toggleModuleAll = (mod: string) => {
    const all = editCrud[mod];
    const allChecked = all.create && all.read && all.edit && all.delete;
    setEditCrud(prev => ({ ...prev, [mod]: { create: !allChecked, read: !allChecked, edit: !allChecked, delete: !allChecked } }));
  };

  const selectAllPermissions = () => {
    const totalChecked = MODULES.reduce((s, m) => s + (editCrud[m]?.create ? 1 : 0) + (editCrud[m]?.read ? 1 : 0) + (editCrud[m]?.edit ? 1 : 0) + (editCrud[m]?.delete ? 1 : 0), 0);
    const allOn = totalChecked === MODULES.length * 4;
    const val = !allOn;
    setEditCrud(MODULES.reduce((acc, mod) => { acc[mod] = { create: val, read: val, edit: val, delete: val }; return acc; }, {}));
  };

  const filtered = roles.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  // Count total permissions for a role
  const countPerms = (crud: any) => MODULES.reduce((s, m) => s + (crud[m]?.create ? 1 : 0) + (crud[m]?.read ? 1 : 0) + (crud[m]?.edit ? 1 : 0) + (crud[m]?.delete ? 1 : 0), 0);

  const columns = [
    {
      title: 'Role', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: 'Permissions', key: 'perms', width: 120,
      render: (_, r) => <Text style={{ fontSize: 12 }}>{countPerms(r.crud)} / {MODULES.length * 4}</Text>,
    },
    {
      title: 'Users', key: 'users', width: 80,
      render: (_, r) => {
        const count = getUserCount(r.id);
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

  // Permission matrix table columns for the modal
  const permColumns = [
    {
      title: (
        <Checkbox
          checked={MODULES.every(m => editCrud[m]?.create && editCrud[m]?.read && editCrud[m]?.edit && editCrud[m]?.delete)}
          indeterminate={MODULES.some(m => editCrud[m]?.create || editCrud[m]?.read || editCrud[m]?.edit || editCrud[m]?.delete) && !MODULES.every(m => editCrud[m]?.create && editCrud[m]?.read && editCrud[m]?.edit && editCrud[m]?.delete)}
          onChange={selectAllPermissions}
        >
          <Text strong style={{ fontSize: 12 }}>Module</Text>
        </Checkbox>
      ),
      dataIndex: 'module',
      key: 'module',
      render: (mod: string) => {
        const all = editCrud[mod];
        const allChecked = all?.create && all?.read && all?.edit && all?.delete;
        const someChecked = (all?.create || all?.read || all?.edit || all?.delete) && !allChecked;
        return (
          <Checkbox checked={allChecked} indeterminate={someChecked} onChange={() => toggleModuleAll(mod)}>
            <Text style={{ fontSize: 12 }}>{mod}</Text>
          </Checkbox>
        );
      },
    },
    { title: 'Create', key: 'create', width: 80, align: 'center' as const, render: (_, r) => <Checkbox checked={editCrud[r.module]?.create} onChange={() => toggleCrud(r.module, 'create')} /> },
    { title: 'Read', key: 'read', width: 80, align: 'center' as const, render: (_, r) => <Checkbox checked={editCrud[r.module]?.read} onChange={() => toggleCrud(r.module, 'read')} /> },
    { title: 'Edit', key: 'edit', width: 80, align: 'center' as const, render: (_, r) => <Checkbox checked={editCrud[r.module]?.edit} onChange={() => toggleCrud(r.module, 'edit')} /> },
    { title: 'Delete', key: 'delete', width: 80, align: 'center' as const, render: (_, r) => <Checkbox checked={editCrud[r.module]?.delete} onChange={() => toggleCrud(r.module, 'delete')} /> },
  ];

  const permData = MODULES.map(m => ({ key: m, module: m }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Roles & Permissions</Title>
          <Text type="secondary">Define roles and control module-level access.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>Create Role</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} allowClear size="small" style={{ width: 280 }} />
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>

      {/* ── Role Modal with CRUD Permission Table ── */}
      <Modal
        title={roleModal.editing ? 'Edit Role' : 'Create Role'}
        open={roleModal.open}
        onCancel={() => { setRoleModal({ open: false, editing: null }); roleForm.resetFields(); }}
        onOk={() => roleForm.submit()}
        okText={roleModal.editing ? 'Save' : 'Create'}
        width={640}
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
            <Input placeholder="Brief description of this role" />
          </Form.Item>
        </Form>

        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Permission Matrix</Text>
        <Table
          dataSource={permData}
          columns={permColumns}
          rowKey="key"
          size="small"
          pagination={false}
          bordered
          style={{ marginBottom: 8 }}
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          {MODULES.reduce((s, m) => s + (editCrud[m]?.create ? 1 : 0) + (editCrud[m]?.read ? 1 : 0) + (editCrud[m]?.edit ? 1 : 0) + (editCrud[m]?.delete ? 1 : 0), 0)} / {MODULES.length * 4} permissions selected
        </Text>
      </Modal>
    </div>
  );
};
