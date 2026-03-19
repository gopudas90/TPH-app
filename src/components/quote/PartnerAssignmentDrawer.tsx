import React from 'react';
import { Drawer, Button, Space, Tag, Slider, Divider, Row, Col, Popconfirm, Typography, theme } from 'antd';
import { RobotOutlined, CheckCircleOutlined, ClockCircleOutlined, StarFilled, ThunderboltOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils';
import type { PartnerRecommendation } from './partnerRecommendations';
import type { QuoteLineItem } from '../../types';

const { Text } = Typography;

interface PartnerAssignmentDrawerProps {
  open: boolean;
  onClose: () => void;
  activeItem: QuoteLineItem | undefined;
  recommendations: PartnerRecommendation[];
  selectedId: string | null;
  onSelectPartner: (id: string) => void;
  customMarkup: number;
  onMarkupChange: (val: number) => void;
  onAssign: () => void;
  onRemove: () => void;
}

export const PartnerAssignmentDrawer: React.FC<PartnerAssignmentDrawerProps> = ({
  open,
  onClose,
  activeItem,
  recommendations,
  selectedId,
  onSelectPartner,
  customMarkup,
  onMarkupChange,
  onAssign,
  onRemove,
}) => {
  const { token } = theme.useToken();

  const selectedPartnerData = recommendations.find((r) => r.id === selectedId);
  const previewPrice = selectedPartnerData
    ? Math.round(selectedPartnerData.rate / (1 - customMarkup / 100))
    : 0;
  const previewProfit = selectedPartnerData ? previewPrice - selectedPartnerData.rate : 0;

  return (
    <Drawer
      title={
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Assign Partner</div>
          {activeItem && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {activeItem.item}
            </Text>
          )}
        </div>
      }
      placement="right"
      open={open}
      onClose={onClose}
      width={520}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {activeItem?.partner && (
              <Popconfirm title="Remove partner from this item?" onConfirm={onRemove}>
                <Button danger size="small">
                  Remove Partner
                </Button>
              </Popconfirm>
            )}
          </div>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              disabled={!selectedId}
              onClick={onAssign}
              icon={<CheckCircleOutlined />}
            >
              Assign Partner
            </Button>
          </Space>
        </div>
      }
    >
      {/* AI Recommendation Banner */}
      <div
        style={{
          padding: '10px 14px',
          background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorInfoBg})`,
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <RobotOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
        <div>
          <Text strong style={{ fontSize: 13 }}>
            AI Recommendations
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Based on service match, past performance, availability, and cost efficiency
          </Text>
        </div>
      </div>

      {/* Partner Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {recommendations.map((partner, idx) => {
          const isSelected = selectedId === partner.id;
          const isTopPick = idx === 0;
          return (
            <div
              key={partner.id}
              onClick={() => onSelectPartner(partner.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: `2px solid ${isSelected ? token.colorPrimary : token.colorBorderSecondary}`,
                background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {isTopPick && (
                <Tag
                  color="gold"
                  style={{ position: 'absolute', top: -10, right: 12, fontSize: 10 }}
                  icon={<ThunderboltOutlined />}
                >
                  Top Pick
                </Tag>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div>
                  <Text strong style={{ fontSize: 14 }}>
                    {partner.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {partner.specialisation}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 16, color: token.colorPrimary }}>
                    {formatCurrency(partner.rate)}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Partner rate
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>{partner.rating}/5</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 12 }}>{partner.onTimeRate}% on-time</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircleOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 12 }}>{partner.engagements} projects</Text>
                </div>
                <Tag
                  color={partner.availability === 'Available' ? 'success' : 'warning'}
                  style={{ fontSize: 10, margin: 0 }}
                >
                  {partner.availability}
                </Tag>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  background: isSelected ? 'rgba(255,255,255,0.6)' : token.colorBgLayout,
                  borderRadius: 6,
                  fontSize: 12,
                  color: token.colorTextSecondary,
                  lineHeight: 1.6,
                }}
              >
                <RobotOutlined style={{ marginRight: 4, color: token.colorPrimary }} />
                {partner.reason}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: `1px solid ${isSelected ? 'rgba(22,119,255,0.2)' : token.colorBorderSecondary}`,
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Contact: {partner.contactName} | {partner.phone}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      {/* Markup Configuration */}
      {selectedId && selectedPartnerData && (
        <div
          style={{
            padding: '16px 18px',
            background: token.colorBgLayout,
            borderRadius: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
            Set Your Markup
          </Text>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Markup Percentage
              </Text>
              <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
                {customMarkup}%
              </Text>
            </div>
            <Slider
              min={5}
              max={80}
              value={customMarkup}
              onChange={onMarkupChange}
              marks={{ 5: '5%', 20: '20%', 35: '35%', 50: '50%', 80: '80%' }}
              tooltip={{ formatter: (val) => `${val}% markup` }}
            />
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Partner Cost
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 600 }}>
                  {formatCurrency(selectedPartnerData.rate)}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Client Price
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 600, color: token.colorPrimary }}>
                  {formatCurrency(previewPrice)}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Your Profit
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 600, color: token.colorSuccess }}>
                  {formatCurrency(previewProfit)}
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Drawer>
  );
};
