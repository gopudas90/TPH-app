import React from 'react';
import { Card, List, Space, Tag, Typography, theme } from 'antd';
import { BulbOutlined, CalendarOutlined } from '@ant-design/icons';
import { getPriorityColor, getActionTypeColor } from '../../utils';
import type { AIRecommendedAction } from '../../types';

const { Text } = Typography;

interface RecommendedActionsCardProps {
  actions: AIRecommendedAction[];
  style?: React.CSSProperties;
}

export const RecommendedActionsCard: React.FC<RecommendedActionsCardProps> = ({ actions, style }) => {
  const { token } = theme.useToken();

  return (
    <Card
      title={<Space size={8}><BulbOutlined style={{ color: token.colorPrimary }} />Next Recommended Actions</Space>}
      style={style}
    >
      <List
        dataSource={actions}
        renderItem={(item) => (
          <div
            style={{
              padding: '12px 14px',
              marginBottom: 10,
              borderRadius: 8,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
              {item.action}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginBottom: 8, lineHeight: 1.5 }}
            >
              {item.detail}
            </Text>
            <Space size={4}>
              <Tag color={getPriorityColor(item.priority)} style={{ fontSize: 11, margin: 0 }}>
                {item.priority}
              </Tag>
              <Tag color={getActionTypeColor(item.type)} style={{ fontSize: 11, margin: 0 }}>
                {item.type}
              </Tag>
              <Tag icon={<CalendarOutlined />} style={{ fontSize: 11, margin: 0 }}>
                {item.timing}
              </Tag>
            </Space>
          </div>
        )}
        locale={{ emptyText: 'No recommendations at this time.' }}
      />
    </Card>
  );
};
