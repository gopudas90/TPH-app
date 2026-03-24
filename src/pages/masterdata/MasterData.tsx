// @ts-nocheck
import React, { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag, Popconfirm,
  Typography, Space, message, theme, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
} from '@ant-design/icons';
import {
  defaultAssetCategories, defaultAssetConditions, defaultCustomerTiers,
  defaultCustomerIndustries, defaultDepartments, defaultEnquiryTypes, defaultEventTypes, uid,
  AssetCategory, AssetSubCategory, AssetCondition, CustomerTier, CustomerIndustry, Department, Designation,
  EnquiryType, EventType,
} from '../../data/masterData';
import { ColorSwatchPicker } from '../../components/masterdata/ColorSwatchPicker';

const { Text } = Typography;

// ─── Shared header row ───────────────────────────────────────
const SectionHeader = ({ subtitle, onAdd, addLabel, searchValue, onSearch, searchPlaceholder }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
    {subtitle
      ? <Text type="secondary" style={{ fontSize: 13, flexShrink: 0 }}>{subtitle}</Text>
      : <span />}
    <Space>
      <Input
        prefix={<SearchOutlined />}
        placeholder={searchPlaceholder || 'Search...'}
        value={searchValue}
        onChange={e => onSearch(e.target.value)}
        allowClear
        size="small"
        style={{ width: 220 }}
      />
      <Button type="primary" icon={<PlusOutlined />} size="small" onClick={onAdd}>{addLabel}</Button>
    </Space>
  </div>
);

// ─── 1. Asset Categories Tab ─────────────────────────────────
const AssetCategoriesTab = () => {
  const { token } = theme.useToken();
  const [categories, setCategories] = useState<AssetCategory[]>(defaultAssetCategories);
  const [search, setSearch] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<AssetCategory | null>(null);
  const [subModal, setSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState<{ sub: AssetSubCategory | null; catId: string } | null>(null);
  const [catForm] = Form.useForm();
  const [subForm] = Form.useForm();

  const openCatModal = (cat?: AssetCategory) => {
    setEditingCat(cat || null);
    catForm.setFieldsValue(cat ? { name: cat.name } : { name: '' });
    setCatModal(true);
  };
  const saveCat = (vals) => {
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, name: vals.name } : c));
      message.success('Category updated');
    } else {
      setCategories(prev => [...prev, { id: uid(), name: vals.name, subCategories: [] }]);
      message.success('Category added');
    }
    setCatModal(false);
    catForm.resetFields();
  };
  const deleteCat = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    message.success('Category deleted');
  };

  const openSubModal = (catId: string, sub?: AssetSubCategory) => {
    setEditingSub({ sub: sub || null, catId });
    subForm.setFieldsValue(sub ? { name: sub.name } : { name: '' });
    setSubModal(true);
  };
  const saveSub = (vals) => {
    const { catId, sub } = editingSub!;
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      if (sub) {
        return { ...c, subCategories: c.subCategories.map(s => s.id === sub.id ? { ...s, name: vals.name } : s) };
      }
      return { ...c, subCategories: [...c.subCategories, { id: uid(), name: vals.name }] };
    }));
    message.success(sub ? 'Sub-category updated' : 'Sub-category added');
    setSubModal(false);
    subForm.resetFields();
  };
  const deleteSub = (catId: string, subId: string) => {
    setCategories(prev => prev.map(c => c.id !== catId ? c : { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) }));
    message.success('Sub-category deleted');
  };

  const expandedRowRender = (cat: AssetCategory) => (
    <div style={{ padding: '8px 0 8px 40px' }}>
      {cat.subCategories.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>No sub-categories yet.</Text>
      )}
      {cat.subCategories.map((sub, idx) => (
        <div
          key={sub.id}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 12px',
            background: idx % 2 === 0 ? token.colorBgLayout : token.colorBgContainer,
            borderRadius: 6, marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 13 }}>{sub.name}</Text>
          <Space size={4}>
            <Tooltip title="Edit">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openSubModal(cat.id, sub)} />
            </Tooltip>
            <Popconfirm title="Delete this sub-category?" onConfirm={() => deleteSub(cat.id, sub.id)} okText="Delete" okType="danger">
              <Tooltip title="Delete">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ))}
      <Button
        type="dashed" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }}
        onClick={() => openSubModal(cat.id)}
      >
        Add Sub-Category
      </Button>
    </div>
  );

  const columns = [
    { title: 'Category Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text strong>{name}</Text> },
    {
      title: 'Sub-Categories', key: 'subCount',
      render: (_, cat) => <Tag>{cat.subCategories.length} sub-{cat.subCategories.length === 1 ? 'category' : 'categories'}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, cat) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openCatModal(cat)} />
          </Tooltip>
          <Popconfirm title="Delete this category and all its sub-categories?" onConfirm={() => deleteCat(cat.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader
        subtitle="Organise assets by category and sub-category"
        onAdd={() => openCatModal()}
        addLabel="Add Category"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search categories..."
      />
      <Table
        dataSource={categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.subCategories.some(s => s.name.toLowerCase().includes(search.toLowerCase())))}
        columns={columns}
        rowKey="id"
        expandable={{ expandedRowRender }}
        pagination={false}
        size="middle"
      />

      {/* Category modal */}
      <Modal
        title={editingCat ? 'Edit Category' : 'Add Category'}
        open={catModal}
        onCancel={() => { setCatModal(false); catForm.resetFields(); }}
        onOk={() => catForm.submit()}
        okText={editingCat ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={catForm} layout="vertical" onFinish={saveCat} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. AV Equipment" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sub-category modal */}
      <Modal
        title={editingSub?.sub ? 'Edit Sub-Category' : 'Add Sub-Category'}
        open={subModal}
        onCancel={() => { setSubModal(false); subForm.resetFields(); }}
        onOk={() => subForm.submit()}
        okText={editingSub?.sub ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={subForm} layout="vertical" onFinish={saveSub} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Sub-Category Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Microphones" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 2. Asset Conditions Tab ──────────────────────────────────
const AssetConditionsTab = () => {
  const [conditions, setConditions] = useState<AssetCondition[]>(defaultAssetConditions);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AssetCondition | null>(null);
  const [form] = Form.useForm();

  const openModal = (cond?: AssetCondition) => {
    setEditing(cond || null);
    form.setFieldsValue(cond ? { name: cond.name, color: cond.color } : { name: '', color: 'blue' });
    setModal(true);
  };
  const save = (vals) => {
    if (editing) {
      setConditions(prev => prev.map(c => c.id === editing.id ? { ...c, ...vals } : c));
      message.success('Condition updated');
    } else {
      setConditions(prev => [...prev, { id: uid(), ...vals }]);
      message.success('Condition added');
    }
    setModal(false);
    form.resetFields();
  };
  const del = (id) => { setConditions(prev => prev.filter(c => c.id !== id)); message.success('Condition deleted'); };

  const columns = [
    { title: 'Condition', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text strong>{name}</Text> },
    { title: 'Tag Color', dataIndex: 'color', key: 'color', render: (color, rec) => <Tag color={color}>{rec.name}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(rec)} /></Tooltip>
          <Popconfirm title="Delete this condition?" onConfirm={() => del(rec.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader subtitle="Define conditions used to classify asset state" onAdd={() => openModal()} addLabel="Add Condition" searchValue={search} onSearch={setSearch} searchPlaceholder="Search conditions..." />
      <Table dataSource={conditions.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))} columns={columns} rowKey="id" pagination={false} size="middle" />
      <Modal
        title={editing ? 'Edit Condition' : 'Add Condition'}
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Save' : 'Add'}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Condition Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Excellent" />
          </Form.Item>
          <Form.Item name="color" label="Tag Color" rules={[{ required: true, message: 'Please select a color' }]}>
            <ColorSwatchPicker />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 3. Customer Tiers Tab ────────────────────────────────────
const CustomerTiersTab = () => {
  const [tiers, setTiers] = useState<CustomerTier[]>(defaultCustomerTiers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CustomerTier | null>(null);
  const [form] = Form.useForm();

  const openModal = (tier?: CustomerTier) => {
    setEditing(tier || null);
    form.setFieldsValue(tier ? { name: tier.name, color: tier.color, description: tier.description } : { name: '', color: 'blue', description: '' });
    setModal(true);
  };
  const save = (vals) => {
    if (editing) {
      setTiers(prev => prev.map(t => t.id === editing.id ? { ...t, ...vals } : t));
      message.success('Tier updated');
    } else {
      setTiers(prev => [...prev, { id: uid(), ...vals }]);
      message.success('Tier added');
    }
    setModal(false);
    form.resetFields();
  };
  const del = (id) => { setTiers(prev => prev.filter(t => t.id !== id)); message.success('Tier deleted'); };

  const columns = [
    { title: 'Tier', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text strong>{name}</Text> },
    { title: 'Tag Color', key: 'color', render: (_, rec) => <Tag color={rec.color}>{rec.name}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (d) => <Text type="secondary" style={{ fontSize: 12 }}>{d || '—'}</Text> },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(rec)} /></Tooltip>
          <Popconfirm title="Delete this tier?" onConfirm={() => del(rec.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader subtitle="Classify customers by engagement and value level" onAdd={() => openModal()} addLabel="Add Tier" searchValue={search} onSearch={setSearch} searchPlaceholder="Search tiers..." />
      <Table dataSource={tiers.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase()))} columns={columns} rowKey="id" pagination={false} size="middle" />
      <Modal
        title={editing ? 'Edit Tier' : 'Add Tier'}
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Save' : 'Add'}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tier Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Platinum" />
          </Form.Item>
          <Form.Item name="color" label="Tag Color" rules={[{ required: true, message: 'Please select a color' }]}>
            <ColorSwatchPicker />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 4. Customer Industries Tab ───────────────────────────────
const CustomerIndustriesTab = () => {
  const [industries, setIndustries] = useState<CustomerIndustry[]>(defaultCustomerIndustries);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CustomerIndustry | null>(null);
  const [form] = Form.useForm();

  const openModal = (ind?: CustomerIndustry) => {
    setEditing(ind || null);
    form.setFieldsValue(ind ? { name: ind.name } : { name: '' });
    setModal(true);
  };
  const save = (vals) => {
    if (editing) {
      setIndustries(prev => prev.map(i => i.id === editing.id ? { ...i, ...vals } : i));
      message.success('Industry updated');
    } else {
      setIndustries(prev => [...prev, { id: uid(), ...vals }]);
      message.success('Industry added');
    }
    setModal(false);
    form.resetFields();
  };
  const del = (id) => { setIndustries(prev => prev.filter(i => i.id !== id)); message.success('Industry deleted'); };

  const columns = [
    { title: 'Industry', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text>{name}</Text> },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(rec)} /></Tooltip>
          <Popconfirm title="Delete this industry?" onConfirm={() => del(rec.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader subtitle="Industry verticals for customer segmentation" onAdd={() => openModal()} addLabel="Add Industry" searchValue={search} onSearch={setSearch} searchPlaceholder="Search industries..." />
      <Table dataSource={industries.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))} columns={columns} rowKey="id" pagination={false} size="middle" />
      <Modal
        title={editing ? 'Edit Industry' : 'Add Industry'}
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Industry Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Corporate" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 5. Departments & Designations Tab ───────────────────────
const DepartmentsTab = () => {
  const { token } = theme.useToken();
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);
  const [search, setSearch] = useState('');
  const [deptModal, setDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [desModal, setDesModal] = useState(false);
  const [editingDes, setEditingDes] = useState<{ des: Designation | null; deptId: string } | null>(null);
  const [deptForm] = Form.useForm();
  const [desForm] = Form.useForm();

  const openDeptModal = (dept?: Department) => {
    setEditingDept(dept || null);
    deptForm.setFieldsValue(dept ? { name: dept.name } : { name: '' });
    setDeptModal(true);
  };
  const saveDept = (vals) => {
    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, name: vals.name } : d));
      message.success('Department updated');
    } else {
      setDepartments(prev => [...prev, { id: uid(), name: vals.name, designations: [] }]);
      message.success('Department added');
    }
    setDeptModal(false);
    deptForm.resetFields();
  };
  const deleteDept = (id) => { setDepartments(prev => prev.filter(d => d.id !== id)); message.success('Department deleted'); };

  const openDesModal = (deptId: string, des?: Designation) => {
    setEditingDes({ des: des || null, deptId });
    desForm.setFieldsValue(des ? { name: des.name } : { name: '' });
    setDesModal(true);
  };
  const saveDes = (vals) => {
    const { deptId, des } = editingDes!;
    setDepartments(prev => prev.map(d => {
      if (d.id !== deptId) return d;
      if (des) {
        return { ...d, designations: d.designations.map(x => x.id === des.id ? { ...x, name: vals.name } : x) };
      }
      return { ...d, designations: [...d.designations, { id: uid(), name: vals.name }] };
    }));
    message.success(des ? 'Designation updated' : 'Designation added');
    setDesModal(false);
    desForm.resetFields();
  };
  const deleteDes = (deptId: string, desId: string) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : { ...d, designations: d.designations.filter(x => x.id !== desId) }));
    message.success('Designation deleted');
  };

  const expandedRowRender = (dept: Department) => (
    <div style={{ padding: '8px 0 8px 40px' }}>
      {dept.designations.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>No designations yet.</Text>
      )}
      {dept.designations.map((des, idx) => (
        <div
          key={des.id}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 12px',
            background: idx % 2 === 0 ? token.colorBgLayout : token.colorBgContainer,
            borderRadius: 6, marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 13 }}>{des.name}</Text>
          <Space size={4}>
            <Tooltip title="Edit">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openDesModal(dept.id, des)} />
            </Tooltip>
            <Popconfirm title="Delete this designation?" onConfirm={() => deleteDes(dept.id, des.id)} okText="Delete" okType="danger">
              <Tooltip title="Delete">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ))}
      <Button
        type="dashed" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }}
        onClick={() => openDesModal(dept.id)}
      >
        Add Designation
      </Button>
    </div>
  );

  const columns = [
    { title: 'Department', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text strong>{name}</Text> },
    {
      title: 'Designations', key: 'desCount',
      render: (_, dept) => <Tag>{dept.designations.length} {dept.designations.length === 1 ? 'designation' : 'designations'}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, dept) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openDeptModal(dept)} /></Tooltip>
          <Popconfirm title="Delete this department and all its designations?" onConfirm={() => deleteDept(dept.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader
        subtitle="Organise your workforce by department and job designation"
        onAdd={() => openDeptModal()}
        addLabel="Add Department"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search departments..."
      />
      <Table
        dataSource={departments.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.designations.some(x => x.name.toLowerCase().includes(search.toLowerCase())))}
        columns={columns}
        rowKey="id"
        expandable={{ expandedRowRender }}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editingDept ? 'Edit Department' : 'Add Department'}
        open={deptModal}
        onCancel={() => { setDeptModal(false); deptForm.resetFields(); }}
        onOk={() => deptForm.submit()}
        okText={editingDept ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={deptForm} layout="vertical" onFinish={saveDept} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Department Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Operations" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingDes?.des ? 'Edit Designation' : 'Add Designation'}
        open={desModal}
        onCancel={() => { setDesModal(false); desForm.resetFields(); }}
        onOk={() => desForm.submit()}
        okText={editingDes?.des ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={desForm} layout="vertical" onFinish={saveDes} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Designation Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Project Manager" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 6. Enquiry Types Tab ──────────────────────────────────
const EnquiryTypesTab = () => {
  const [items, setItems] = useState<EnquiryType[]>(defaultEnquiryTypes);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<EnquiryType | null>(null);
  const [form] = Form.useForm();

  const openModal = (item?: EnquiryType) => {
    setEditing(item || null);
    form.setFieldsValue(item ? { name: item.name } : { name: '' });
    setModal(true);
  };
  const save = (vals) => {
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...vals } : i));
      message.success('Enquiry type updated');
    } else {
      setItems(prev => [...prev, { id: uid(), ...vals }]);
      message.success('Enquiry type added');
    }
    setModal(false);
    form.resetFields();
  };
  const del = (id) => { setItems(prev => prev.filter(i => i.id !== id)); message.success('Enquiry type deleted'); };

  const columns = [
    { title: 'Enquiry Type', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text>{name}</Text> },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(rec)} /></Tooltip>
          <Popconfirm title="Delete this enquiry type?" onConfirm={() => del(rec.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader subtitle="Sources and types of client enquiries" onAdd={() => openModal()} addLabel="Add Enquiry Type" searchValue={search} onSearch={setSearch} searchPlaceholder="Search enquiry types..." />
      <Table dataSource={items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))} columns={columns} rowKey="id" pagination={false} size="middle" />
      <Modal
        title={editing ? 'Edit Enquiry Type' : 'Add Enquiry Type'}
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Enquiry Type Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Inbound — Website Form" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── 7. Event Types Tab ────────────────────────────────────
const EventTypesTab = () => {
  const [items, setItems] = useState<EventType[]>(defaultEventTypes);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form] = Form.useForm();

  const openModal = (item?: EventType) => {
    setEditing(item || null);
    form.setFieldsValue(item ? { name: item.name } : { name: '' });
    setModal(true);
  };
  const save = (vals) => {
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...vals } : i));
      message.success('Event type updated');
    } else {
      setItems(prev => [...prev, { id: uid(), ...vals }]);
      message.success('Event type added');
    }
    setModal(false);
    form.resetFields();
  };
  const del = (id) => { setItems(prev => prev.filter(i => i.id !== id)); message.success('Event type deleted'); };

  const columns = [
    { title: 'Event Type', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name) => <Text>{name}</Text> },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(rec)} /></Tooltip>
          <Popconfirm title="Delete this event type?" onConfirm={() => del(rec.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SectionHeader subtitle="Types of events TPH produces" onAdd={() => openModal()} addLabel="Add Event Type" searchValue={search} onSearch={setSearch} searchPlaceholder="Search event types..." />
      <Table dataSource={items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))} columns={columns} rowKey="id" pagination={false} size="middle" />
      <Modal
        title={editing ? 'Edit Event Type' : 'Add Event Type'}
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Event Type Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Conference" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const MasterAssetCategories: React.FC = () => <AssetCategoriesTab />;
export const MasterAssetConditions: React.FC = () => <AssetConditionsTab />;
export const MasterCustomerTiers: React.FC = () => <CustomerTiersTab />;
export const MasterCustomerIndustries: React.FC = () => <CustomerIndustriesTab />;
export const MasterDepartments: React.FC = () => <DepartmentsTab />;
export const MasterEnquiryTypes: React.FC = () => <EnquiryTypesTab />;
export const MasterEventTypes: React.FC = () => <EventTypesTab />;
