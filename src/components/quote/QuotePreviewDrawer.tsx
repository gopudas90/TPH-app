import React from 'react';
import { Drawer, Button, Space, Tag, Typography } from 'antd';
import { DownloadOutlined, SendOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils';
import type { Quote, QuoteLineItem, PaymentMilestone } from '../../types';

const { Text } = Typography;

interface QuotePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  quote: Quote;
  items: QuoteLineItem[];
  milestones: PaymentMilestone[];
  terms: string;
  subtotal: number;
  totalDiscount: number;
  tax: number;
  total: number;
}

export const QuotePreviewDrawer: React.FC<QuotePreviewDrawerProps> = ({
  open,
  onClose,
  onSend,
  quote,
  items,
  milestones,
  terms,
  subtotal,
  totalDiscount,
  tax,
  total,
}) => {
  return (
    <Drawer
      title="Quote Preview"
      placement="right"
      open={open}
      onClose={onClose}
      width={720}
      extra={
        <Space>
          <Button icon={<DownloadOutlined />}>Download PDF</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={onSend}>
            Send to Client
          </Button>
        </Space>
      }
    >
      <div
        style={{
          padding: '48px 56px',
          background: '#fff',
          color: '#000',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* PDF Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 40,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: '#ff6b6b',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 20,
                }}
              >
                T
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                  The Production House
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>Event Production & Management</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, marginTop: 8 }}>
              10 Anson Road, #12-01
              <br />
              International Plaza, Singapore 079903
              <br />
              +65 6789 0123 | quotes@tph.sg
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff6b6b', marginBottom: 4 }}>
              QUOTATION
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              QT-2026-{quote.id.padStart(4, '0')}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>Date: {quote.date}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Valid Until: {quote.validUntil}</div>
            <Tag
              color={
                quote.status === 'Approved'
                  ? 'success'
                  : quote.status === 'Sent'
                  ? 'processing'
                  : 'default'
              }
              style={{ marginTop: 8 }}
            >
              {quote.status}
            </Tag>
          </div>
        </div>

        {/* Client Info */}
        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 6,
            padding: '16px 20px',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Bill To
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{quote.client}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                123 Tech Blvd, Silicon Valley, CA 94025
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Event
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                {quote.eventName}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>Prepared by: {quote.preparedBy}</div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              {['#', 'Description', 'Qty', 'Unit Price', 'Discount', 'Total'].map((header, i) => (
                <th
                  key={header}
                  style={{
                    padding: '10px 8px',
                    textAlign: i === 0 || i === 1 ? 'left' : i === 2 ? 'center' : 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '10px 8px', fontSize: 12, color: '#888' }}>{idx + 1}</td>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
                    {item.item}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {item.category}
                    {item.partner ? ` • via ${item.partner.name}` : ''}
                  </div>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13 }}>
                  {item.qty}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13 }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'right',
                    fontSize: 13,
                    color: item.discount > 0 ? '#ff4d4f' : '#888',
                  }}
                >
                  {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'right',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(item.unitPrice * item.qty - item.discount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ width: 280 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 13,
              }}
            >
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 13,
              }}
            >
              <span style={{ color: '#ff4d4f' }}>Discount</span>
              <span style={{ color: '#ff4d4f' }}>-{formatCurrency(totalDiscount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 13,
              }}
            >
              <span style={{ color: '#666' }}>GST (9%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                fontSize: 18,
                fontWeight: 700,
                borderTop: '2px solid #1a1a1a',
                marginTop: 4,
                color: '#1a1a1a',
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Milestones */}
        {milestones.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Payment Schedule
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                  {['Milestone', '%', 'Amount', 'Due Date'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px',
                        textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                        fontSize: 11,
                        color: '#888',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px', fontSize: 12 }}>{m.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: 12 }}>
                      {m.percentage}%
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {formatCurrency(m.amount)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontSize: 12 }}>
                      {m.dueDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Terms */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Terms & Conditions
          </div>
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {terms}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e8e8e8',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
              Authorized Signature
            </div>
            <div style={{ width: 200, borderBottom: '1px solid #ccc', height: 40 }} />
            <div style={{ fontSize: 12, color: '#1a1a1a', marginTop: 4 }}>
              {quote.preparedBy}
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>The Production House Singapore</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Client Acceptance</div>
            <div style={{ width: 200, borderBottom: '1px solid #ccc', height: 40 }} />
            <div style={{ fontSize: 12, color: '#1a1a1a', marginTop: 4 }}>{quote.client}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Date: _______________</div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
