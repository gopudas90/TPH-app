import React from 'react';
import { Button, Tooltip, theme } from 'antd';
import { FormOutlined, FolderOpenOutlined, MessageOutlined } from '@ant-design/icons';

interface SideTriggerPaneProps {
  onNotesClick: () => void;
  onDocumentsClick: () => void;
  onChatClick?: () => void;
}

export const SideTriggerPane: React.FC<SideTriggerPaneProps> = ({ onNotesClick, onDocumentsClick, onChatClick }) => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '30%',
        background: token.colorBgContainer,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 1000,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRight: 'none',
      }}
    >
      <Tooltip title="Notes" placement="left">
        <Button
          type="text"
          icon={<FormOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />}
          onClick={onNotesClick}
        />
      </Tooltip>
      <Tooltip title="Documents" placement="left">
        <Button
          type="text"
          icon={<FolderOpenOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />}
          onClick={onDocumentsClick}
        />
      </Tooltip>
      {onChatClick && (
        <Tooltip title="Chat" placement="left">
          <Button
            type="text"
            icon={<MessageOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />}
            onClick={onChatClick}
          />
        </Tooltip>
      )}
    </div>
  );
};
