import React from 'react';
import { Card, Progress, Space, Typography, theme } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { getHealthScoreColor, getHealthScoreLabel } from '../../utils';

const { Text } = Typography;

interface BreakdownItem {
  label: string;
  value: number;
}

interface HealthScoreCardProps {
  score: number;
  breakdown: BreakdownItem[];
  style?: React.CSSProperties;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, breakdown, style }) => {
  const { token } = theme.useToken();
  const colorMap = { success: token.colorSuccess, warning: token.colorWarning, error: token.colorError };
  const color = colorMap[getHealthScoreColor(score)];
  const label = getHealthScoreLabel(score);

  return (
    <Card
      title={<Space size={8}><RobotOutlined style={{ color: token.colorPrimary }} />AI Health Score</Space>}
      style={style}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Progress
          type="dashboard"
          percent={score}
          strokeColor={color}
          format={() => (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{score}</div>
              <div style={{ fontSize: 11, color: token.colorTextSecondary }}>{label}</div>
            </div>
          )}
          size={130}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {breakdown.map((item) => {
          const itemColor = colorMap[getHealthScoreColor(item.value)];
          return (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                <Text style={{ fontSize: 12, fontWeight: 500 }}>{item.value}%</Text>
              </div>
              <Progress percent={item.value} size="small" showInfo={false} strokeColor={itemColor} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
