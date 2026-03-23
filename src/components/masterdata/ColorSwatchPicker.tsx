// @ts-nocheck
import React from 'react';
import { Tag, theme } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const PRESET_COLORS = [
  'red', 'volcano', 'orange', 'gold', 'yellow',
  'lime', 'green', 'cyan', 'blue', 'geekblue',
  'purple', 'magenta', 'pink', 'default',
];

interface ColorSwatchPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({ value, onChange }) => {
  const { token } = theme.useToken();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' }}>
      {PRESET_COLORS.map(color => (
        <div
          key={color}
          onClick={() => onChange?.(color)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <Tag
            color={color}
            style={{
              margin: 0,
              minWidth: 64,
              textAlign: 'center',
              border: value === color ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
              borderRadius: 6,
              fontWeight: value === color ? 700 : 400,
              fontSize: 12,
              padding: '2px 8px',
            }}
          >
            {value === color && (
              <CheckOutlined style={{ marginRight: 4, fontSize: 10 }} />
            )}
            {color}
          </Tag>
        </div>
      ))}
    </div>
  );
};
