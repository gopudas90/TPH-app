import React, { useState } from 'react';
import { Drawer, List, Button, Input, Typography, theme } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Note } from '../../types';

const { Text } = Typography;
const { TextArea } = Input;

interface NotesDrawerProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onAdd: (text: string) => void;
  onDelete: (id: string | number) => void;
  width?: number;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  open,
  onClose,
  notes,
  onAdd,
  onDelete,
  width = 400,
}) => {
  const { token } = theme.useToken();
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (newNote.trim()) {
      onAdd(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <Drawer title="Notes" placement="right" onClose={onClose} open={open} width={width}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          <List
            itemLayout="horizontal"
            dataSource={notes}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                actions={[
                  <Button type="text" size="small" icon={<EditOutlined />} key="edit" />,
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(item.id)}
                    key="delete"
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<Text type="secondary" style={{ fontSize: 11 }}>{item.date}</Text>}
                  description={<Text style={{ fontSize: 13, color: token.colorText }}>{item.text}</Text>}
                />
              </List.Item>
            )}
          />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <TextArea
            rows={3}
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Button type="primary" block onClick={handleAdd}>
            Add Note
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
