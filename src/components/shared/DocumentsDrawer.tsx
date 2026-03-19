import React from 'react';
import { Drawer, List, Button, Typography, theme } from 'antd';
import { PlusOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { Document } from '../../types';

const { Text } = Typography;

interface DocumentsDrawerProps {
  open: boolean;
  onClose: () => void;
  documents: Document[];
  onDelete?: (id: string | number) => void;
  width?: number;
}

export const DocumentsDrawer: React.FC<DocumentsDrawerProps> = ({
  open,
  onClose,
  documents,
  onDelete,
  width = 400,
}) => {
  const { token } = theme.useToken();

  return (
    <Drawer title="Documents" placement="right" onClose={onClose} open={open} width={width}>
      <div style={{ marginBottom: 16 }}>
        <Button type="dashed" block icon={<PlusOutlined />} style={{ height: 60 }}>
          Upload Document
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={documents}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
            actions={
              onDelete
                ? [<Button type="text" size="small" danger icon={<DeleteOutlined />} key="del" onClick={() => onDelete(item.id)} />]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={<FilePdfOutlined style={{ fontSize: 24, color: token.colorError }} />}
              title={<a href="#">{item.name}</a>}
              description={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {item.date} • {item.size}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};
