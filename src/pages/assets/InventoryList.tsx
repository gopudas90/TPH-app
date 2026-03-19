// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Typography, Card, Table, Tag, Input, Button, Space, theme, Tabs, Tooltip, Progress, Popconfirm, message, InputNumber, Row, Col, Statistic, Badge, Descriptions, Modal, Select, Drawer } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, WarningOutlined, ShopOutlined, SaveOutlined, CloseOutlined, ExclamationCircleOutlined, InboxOutlined, BarChartOutlined, HistoryOutlined } from '@ant-design/icons';
import { MOCK_CONSUMABLES, MOCK_CONSUMPTION_LOG } from '../../data/mockData';
import { formatCurrency } from '../../utils';

const { Title, Text } = Typography;

const getCategoryColor = (cat: string) => {
  const map: Record<string, string> = {
    'Electrical Cable': 'blue',
    'Rigging Hardware': 'orange',
    'Staging Surfaces': 'purple',
    'Décor Materials': 'magenta',
  };
  return map[cat] || 'default';
};

export const InventoryList: React.FC = () => {
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const [consumables, setConsumables] = useState(MOCK_CONSUMABLES);
  const [activeTab, setActiveTab] = useState('inventory');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);
  const [activeSupplierItem, setActiveSupplierItem] = useState<any>(null);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logProjectFilter, setLogProjectFilter] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const totalItems = consumables.length;
    const totalValue = consumables.reduce((acc, c) => acc + c.currentStock * c.lastPurchasePrice, 0);
    const lowStock = consumables.filter(c => c.currentStock <= c.minimumThreshold).length;
    const categories = [...new Set(consumables.map(c => c.category))].length;
    return { totalItems, totalValue, lowStock, categories };
  }, [consumables]);

  // Consumption stats
  const consumptionStats = useMemo(() => {
    const totalConsumed = MOCK_CONSUMPTION_LOG.reduce((acc, l) => acc + l.totalCost, 0);
    const projectCosts = MOCK_CONSUMPTION_LOG.reduce((acc: Record<string, number>, l) => {
      acc[l.project] = (acc[l.project] || 0) + l.totalCost;
      return acc;
    }, {});
    return { totalConsumed, projectCosts };
  }, []);

  const uniqueCategories = [...new Set(consumables.map(c => c.category))];
  const uniqueProjects = [...new Set(MOCK_CONSUMPTION_LOG.map(l => l.project))];

  const filteredConsumables = consumables.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredLog = MOCK_CONSUMPTION_LOG.filter(l => {
    const matchesSearch = l.consumableName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      l.project.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      l.issuedTo.toLowerCase().includes(logSearchTerm.toLowerCase());
    const matchesProject = !logProjectFilter || l.project === logProjectFilter;
    return matchesSearch && matchesProject;
  });

  const handleDelete = (id: string) => {
    setConsumables(consumables.filter(c => c.id !== id));
    message.success('Item removed');
  };

  const startEdit = (record: any) => {
    setEditingId(record.id);
    setEditStock(record.currentStock);
    setEditThreshold(record.minimumThreshold);
  };

  const saveEdit = (id: string) => {
    setConsumables(consumables.map(c =>
      c.id === id ? { ...c, currentStock: editStock, minimumThreshold: editThreshold } : c
    ));
    setEditingId(null);
    message.success('Stock updated');
  };

  const openSupplierDetails = (record: any) => {
    setActiveSupplierItem(record);
    setSupplierDrawerOpen(true);
  };

  const inventoryColumns = [
    {
      title: 'Item', dataIndex: 'name', key: 'name', width: 280,
      render: (text: string, record: any) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <br />
          <Tag color={getCategoryColor(record.category)} style={{ fontSize: 10, marginTop: 2 }}>{record.category}</Tag>
        </div>
      )
    },
    {
      title: 'Stock', key: 'stock', width: 160,
      render: (_: any, record: any) => {
        const isLow = record.currentStock <= record.minimumThreshold;
        if (editingId === record.id) {
          return (
            <Space direction="vertical" size={4}>
              <InputNumber size="small" min={0} value={editStock} onChange={v => setEditStock(v || 0)} style={{ width: 80 }} addonAfter={record.unit} />
              <Text type="secondary" style={{ fontSize: 10 }}>Min: <InputNumber size="small" min={0} value={editThreshold} onChange={v => setEditThreshold(v || 0)} style={{ width: 60 }} /></Text>
            </Space>
          );
        }
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ fontSize: 14, color: isLow ? token.colorError : token.colorText }}>
                {record.currentStock}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.unit}s</Text>
              {isLow && <WarningOutlined style={{ color: token.colorError, fontSize: 13 }} />}
            </div>
            <div style={{ marginTop: 2 }}>
              <Progress
                percent={Math.min((record.currentStock / (record.minimumThreshold * 2)) * 100, 100)}
                size="small"
                showInfo={false}
                strokeColor={isLow ? token.colorError : record.currentStock <= record.minimumThreshold * 1.5 ? token.colorWarning : token.colorSuccess}
                style={{ width: 100 }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 10 }}>Min: {record.minimumThreshold}</Text>
          </div>
        );
      }
    },
    {
      title: 'Unit Price', dataIndex: 'lastPurchasePrice', key: 'price',
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Stock Value', key: 'value',
      render: (_: any, record: any) => (
        <Text style={{ fontSize: 13 }}>{formatCurrency(record.currentStock * record.lastPurchasePrice)}</Text>
      )
    },
    {
      title: 'Supplier', dataIndex: 'supplier', key: 'supplier',
      render: (text: string, record: any) => (
        <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }} onClick={() => openSupplierDetails(record)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Last Purchased', dataIndex: 'lastPurchaseDate', key: 'lastPurchaseDate',
      render: (val: string) => <Text type="secondary" style={{ fontSize: 12 }}>{val}</Text>
    },
    {
      title: 'Status', key: 'status',
      render: (_: any, record: any) => {
        if (record.currentStock === 0) return <Tag color="error">Out of Stock</Tag>;
        if (record.currentStock <= record.minimumThreshold) return <Tag color="warning">Low Stock</Tag>;
        return <Tag color="success">In Stock</Tag>;
      }
    },
    {
      title: 'Action', key: 'action', width: 100,
      render: (_: any, record: any) => {
        if (editingId === record.id) {
          return (
            <Space size="small">
              <Button type="text" size="small" icon={<SaveOutlined />} onClick={() => saveEdit(record.id)} style={{ color: token.colorSuccess }} />
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setEditingId(null)} />
            </Space>
          );
        }
        return (
          <Space size="small">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => startEdit(record)} />
            <Popconfirm title="Remove this item?" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      }
    },
  ];

  const consumptionColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date', width: 100, render: (val: string) => <Text style={{ fontSize: 12 }}>{val}</Text> },
    {
      title: 'Item', dataIndex: 'consumableName', key: 'item',
      render: (text: string) => <Text strong style={{ fontSize: 12 }}>{text}</Text>
    },
    {
      title: 'Project', dataIndex: 'project', key: 'project',
      render: (text: string) => <Tag color="blue" style={{ fontSize: 11 }}>{text}</Tag>
    },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', align: 'center' as const },
    {
      title: 'Unit Cost', dataIndex: 'unitCost', key: 'unitCost', align: 'right' as const,
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost', align: 'right' as const,
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>
    },
    { title: 'Issued To', dataIndex: 'issuedTo', key: 'issuedTo', render: (val: string) => <Text style={{ fontSize: 12 }}>{val}</Text> },
    {
      title: 'Notes', dataIndex: 'notes', key: 'notes',
      render: (val: string) => (
        <Tooltip title={val}>
          <Text type="secondary" style={{ fontSize: 11 }}>{val.length > 30 ? val.substring(0, 30) + '...' : val}</Text>
        </Tooltip>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Inventory & Consumables</Title>
          <Text type="secondary">Track stock levels, supplier records, and project consumption.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>Add Item</Button>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Total Items" value={stats.totalItems} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Total Stock Value" value={stats.totalValue} formatter={v => formatCurrency(v as number)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Badge count={stats.lowStock} offset={[10, 0]}>
              <Statistic title="Low Stock Alerts" value={stats.lowStock} prefix={<WarningOutlined />} valueStyle={{ color: stats.lowStock > 0 ? token.colorError : token.colorSuccess }} />
            </Badge>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Categories" value={stats.categories} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'inventory',
            label: <span><InboxOutlined style={{ marginRight: 6 }} />Stock Register</span>,
            children: (
              <Card styles={{ body: { padding: 0 } }}>
                <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}`, display: 'flex', gap: 12 }}>
                  <Input
                    placeholder="Search by name, category, or supplier..."
                    prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: 350 }}
                  />
                  <Select
                    placeholder="All Categories"
                    allowClear
                    value={categoryFilter}
                    onChange={val => setCategoryFilter(val || null)}
                    style={{ width: 200 }}
                    options={uniqueCategories.map(c => ({ label: c, value: c }))}
                  />
                </div>
                <Table
                  columns={inventoryColumns}
                  dataSource={filteredConsumables}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                  rowClassName={(record) => record.currentStock <= record.minimumThreshold ? 'low-stock-row' : ''}
                />
              </Card>
            ),
          },
          {
            key: 'consumption',
            label: <span><HistoryOutlined style={{ marginRight: 6 }} />Consumption Log</span>,
            children: (
              <div>
                {/* Cost Allocation Summary */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Card styles={{ body: { padding: '14px 18px' } }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Total Consumed (All Projects)</Text>
                      <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{formatCurrency(consumptionStats.totalConsumed)}</Text>
                    </Card>
                  </Col>
                  {Object.entries(consumptionStats.projectCosts).slice(0, 2).map(([project, cost]) => (
                    <Col span={8} key={project}>
                      <Card styles={{ body: { padding: '14px 18px' } }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{project}</Text>
                        <Text strong style={{ fontSize: 20 }}>{formatCurrency(cost as number)}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Card styles={{ body: { padding: 0 } }}>
                  <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}`, display: 'flex', gap: 12 }}>
                    <Input
                      placeholder="Search by item, project, or person..."
                      prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                      value={logSearchTerm}
                      onChange={e => setLogSearchTerm(e.target.value)}
                      style={{ width: 350 }}
                    />
                    <Select
                      placeholder="All Projects"
                      allowClear
                      value={logProjectFilter}
                      onChange={val => setLogProjectFilter(val || null)}
                      style={{ width: 220 }}
                      options={uniqueProjects.map(p => ({ label: p, value: p }))}
                    />
                  </div>
                  <Table
                    columns={consumptionColumns}
                    dataSource={filteredLog}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    summary={(data) => {
                      const totalQty = data.reduce((acc, r) => acc + r.quantity, 0);
                      const totalCost = data.reduce((acc, r) => acc + r.totalCost, 0);
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Total</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="center"><Text strong>{totalQty}</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                          <Table.Summary.Cell index={3} align="right"><Text strong>{formatCurrency(totalCost)}</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={4} colSpan={2} />
                        </Table.Summary.Row>
                      );
                    }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* Supplier Details Drawer */}
      <Drawer
        title="Supplier Details"
        placement="right"
        open={supplierDrawerOpen}
        onClose={() => setSupplierDrawerOpen(false)}
        width={400}
      >
        {activeSupplierItem && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: token.colorPrimaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShopOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>{activeSupplierItem.supplier}</Title>
            </div>

            <Descriptions column={1} bordered size="small" labelStyle={{ width: 120 }}>
              <Descriptions.Item label="Contact">{activeSupplierItem.supplierContact}</Descriptions.Item>
              <Descriptions.Item label="Email"><a href={`mailto:${activeSupplierItem.supplierEmail}`}>{activeSupplierItem.supplierEmail}</a></Descriptions.Item>
              <Descriptions.Item label="Phone">{activeSupplierItem.supplierPhone}</Descriptions.Item>
              <Descriptions.Item label="Last Order">{activeSupplierItem.lastPurchaseDate}</Descriptions.Item>
              <Descriptions.Item label="Last Price">{formatCurrency(activeSupplierItem.lastPurchasePrice)} / {activeSupplierItem.unit}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Items from this supplier</Text>
              {consumables
                .filter(c => c.supplier === activeSupplierItem.supplier)
                .map(c => {
                  const isLow = c.currentStock <= c.minimumThreshold;
                  return (
                    <div key={c.id} style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 8, border: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgLayout }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12 }}>{c.name}</Text>
                        {isLow && <Tag color="warning" style={{ fontSize: 10, margin: 0 }}>Low</Tag>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Stock: {c.currentStock} {c.unit}s</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{formatCurrency(c.lastPurchasePrice)} / {c.unit}</Text>
                      </div>
                    </div>
                  );
                })}
            </div>

            <Button type="primary" block style={{ marginTop: 24 }} icon={<PlusOutlined />}>
              Reorder from Supplier
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};
