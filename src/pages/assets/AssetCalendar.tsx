// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Typography, Card, Button, Space, theme, Tag, Tooltip, Select, Row, Col, Badge, Segmented, Switch, Popover, Modal } from 'antd';
import { LeftOutlined, RightOutlined, WarningOutlined, CalendarOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { MOCK_ASSET_BOOKINGS, MOCK_ASSETS } from '../../data/mockData';
import { detectConflicts } from '../../utils/assetUtils';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#1677ff',
  'checked-out': '#52c41a',
  returned: '#8c8c8c',
  pending: '#fa8c16',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  'checked-out': 'Checked Out',
  returned: 'Returned',
  pending: 'Pending',
};

// Helper: get Monday of the week containing the given date
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: format date as "10 Mar"
const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
};

// Helper: format full date like "Wednesday, 11 March 2026"
const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const AssetCalendar: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026 to show data
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [groupByAsset, setGroupByAsset] = useState(false);
  const [dayModalBookings, setDayModalBookings] = useState<any[] | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const monthLabel = currentDate.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };
  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date(2026, 2, 1));

  const handlePrev = () => {
    if (viewMode === 'month') prevMonth();
    else if (viewMode === 'week') prevWeek();
    else prevDay();
  };
  const handleNext = () => {
    if (viewMode === 'month') nextMonth();
    else if (viewMode === 'week') nextWeek();
    else nextDay();
  };

  // Header label based on view mode
  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return monthLabel;
    if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)} ${weekEnd.getFullYear()}`;
    }
    return formatFullDate(currentDate);
  }, [viewMode, currentDate, monthLabel]);

  // All conflicts across fleet
  const allConflicts = useMemo(() => {
    const uniqueAssetIds = [...new Set(MOCK_ASSET_BOOKINGS.map(b => b.assetId))];
    const conflicts: Array<{ booking1: any; booking2: any }> = [];
    uniqueAssetIds.forEach(id => {
      conflicts.push(...detectConflicts(id, MOCK_ASSET_BOOKINGS));
    });
    return conflicts;
  }, []);

  // Conflict booking IDs for quick lookup
  const conflictBookingIds = useMemo(() => {
    const ids = new Set<string>();
    allConflicts.forEach(c => {
      ids.add(c.booking1.id);
      ids.add(c.booking2.id);
    });
    return ids;
  }, [allConflicts]);

  // Filter bookings for the current visible range
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const filteredBookings = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    if (viewMode === 'month') {
      rangeStart = monthStart;
      rangeEnd = monthEnd;
    } else if (viewMode === 'week') {
      rangeStart = getWeekStart(currentDate);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 6);
    } else {
      rangeStart = new Date(currentDate);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(currentDate);
      rangeEnd.setHours(23, 59, 59, 999);
    }

    return MOCK_ASSET_BOOKINGS.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const inRange = start <= rangeEnd && end >= rangeStart;
      const matchesAsset = !assetFilter || b.assetId === assetFilter;
      const matchesStatus = !statusFilter || b.status === statusFilter;
      return inRange && matchesAsset && matchesStatus;
    });
  }, [year, month, assetFilter, statusFilter, viewMode, currentDate]);

  // Build calendar grid data: for each day, what bookings are active
  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; bookings: any[] }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayBookings = filteredBookings.filter(b => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return date >= start && date <= end;
      });
      days.push({ day: d, bookings: dayBookings });
    }
    return days;
  }, [filteredBookings, daysInMonth, year, month]);

  // Week view data
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return [];
    const weekStart = getWeekStart(currentDate);
    const days: Array<{ date: Date; day: number; month: number; year: number; bookings: any[] }> = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayBookings = filteredBookings.filter(b => {
        const start = new Date(b.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(b.endDate);
        end.setHours(23, 59, 59, 999);
        const compareDate = new Date(date);
        compareDate.setHours(12, 0, 0, 0);
        return compareDate >= start && compareDate <= end;
      });
      days.push({ date, day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), bookings: dayBookings });
    }
    return days;
  }, [viewMode, currentDate, filteredBookings]);

  // Day view data
  const dayBookings = useMemo(() => {
    if (viewMode !== 'day') return [];
    const date = new Date(currentDate);
    date.setHours(12, 0, 0, 0);
    return filteredBookings.filter(b => {
      const start = new Date(b.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(b.endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  }, [viewMode, currentDate, filteredBookings]);

  // Stats
  const stats = useMemo(() => {
    const checkingOut = filteredBookings.filter(b => {
      const start = new Date(b.startDate);
      return start >= monthStart && start <= monthEnd && (b.status === 'confirmed' || b.status === 'checked-out');
    });
    const checkingIn = filteredBookings.filter(b => {
      const end = new Date(b.endDate);
      return end >= monthStart && end <= monthEnd;
    });
    const conflictsThisMonth = allConflicts.filter(c => {
      const s1 = new Date(c.booking1.startDate);
      const e1 = new Date(c.booking1.endDate);
      const s2 = new Date(c.booking2.startDate);
      const e2 = new Date(c.booking2.endDate);
      return (s1 <= monthEnd && e1 >= monthStart) || (s2 <= monthEnd && e2 >= monthStart);
    });
    return { goingOut: checkingOut.length, comingIn: checkingIn.length, conflicts: conflictsThisMonth.length, total: filteredBookings.length };
  }, [filteredBookings, allConflicts, monthStart, monthEnd]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const isToday = (day: number, m?: number, y?: number) => {
    const checkMonth = m !== undefined ? m : month;
    const checkYear = y !== undefined ? y : year;
    return today.getFullYear() === checkYear && today.getMonth() === checkMonth && today.getDate() === day;
  };

  // Check if a day has conflicting bookings
  const dayHasConflict = (dayBookings: any[]) => {
    return dayBookings.some(b => conflictBookingIds.has(b.id));
  };

  // Group bookings by asset
  const groupBookingsByAsset = (bookings: any[]) => {
    const groups: Record<string, any[]> = {};
    bookings.forEach(b => {
      const key = b.assetName || b.assetId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  // Render a booking pill (reusable across views)
  const renderBookingPill = (b: any, dayNum: number, monthNum: number, maxWidth?: string) => {
    const isConflict = conflictBookingIds.has(b.id);
    const isStart = new Date(b.startDate).getDate() === dayNum && new Date(b.startDate).getMonth() === monthNum;
    const isEnd = new Date(b.endDate).getDate() === dayNum && new Date(b.endDate).getMonth() === monthNum;

    return (
      <Tooltip
        key={b.id + '-' + dayNum}
        title={
          <div style={{ fontSize: 11 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.assetName}</div>
            <div>Project: {b.projectName}</div>
            <div>{b.startDate} → {b.endDate}</div>
            <div>Status: {STATUS_LABELS[b.status]}</div>
            {b.checkedOutBy && <div>By: {b.checkedOutBy}</div>}
            {isConflict && <div style={{ color: '#ff4d4f', marginTop: 4, fontWeight: 600 }}>Conflicts with another booking</div>}
          </div>
        }
      >
        <div
          onClick={() => navigate(`/asset/${b.assetId}`)}
          style={{
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 10,
            lineHeight: '16px',
            background: STATUS_COLORS[b.status],
            color: '#fff',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: isConflict ? '2px solid #ff4d4f' : 'none',
            position: 'relative',
            maxWidth: maxWidth || undefined,
          }}
        >
          {isStart && <span style={{ marginRight: 2 }}>▶</span>}
          {b.assetName.length > 20 ? b.assetName.substring(0, 20) + '...' : b.assetName}
          {isEnd && <span style={{ marginLeft: 2 }}>◀</span>}
        </div>
      </Tooltip>
    );
  };

  // Render the "+N more" popover for a day cell
  const renderMorePopover = (allBookings: any[], visibleCount: number, dayNum: number, monthNum: number) => {
    const remaining = allBookings.length - visibleCount;
    if (remaining <= 0) return null;

    const popoverContent = (
      <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220 }}>
        {allBookings.map(b => {
          const isConflict = conflictBookingIds.has(b.id);
          return (
            <div
              key={b.id}
              onClick={() => navigate(`/asset/${b.assetId}`)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                background: STATUS_COLORS[b.status],
                color: '#fff',
                cursor: 'pointer',
                border: isConflict ? '2px solid #ff4d4f' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.assetName}</span>
              <Tag style={{ fontSize: 9, margin: 0, lineHeight: '14px', height: 'auto', padding: '0 4px' }} color={isConflict ? 'error' : undefined}>
                {STATUS_LABELS[b.status]}
              </Tag>
            </div>
          );
        })}
      </div>
    );

    return (
      <Popover content={popoverContent} title={`All bookings for day ${dayNum}`} trigger="click" overlayStyle={{ maxWidth: 320 }}>
        <Text type="secondary" style={{ fontSize: 10, paddingLeft: 4, cursor: 'pointer', textDecoration: 'underline' }}>+{remaining} more</Text>
      </Popover>
    );
  };

  // Render a detailed booking row for day view
  const renderDayViewBookingRow = (b: any) => {
    const isConflict = conflictBookingIds.has(b.id);
    return (
      <div
        key={b.id}
        onClick={() => navigate(`/asset/${b.assetId}`)}
        style={{
          padding: '10px 14px',
          borderRadius: 6,
          background: isConflict ? 'rgba(255, 77, 79, 0.06)' : token.colorBgLayout,
          border: isConflict ? '1px solid #ff4d4f' : `1px solid ${token.colorBorderSecondary}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = token.colorPrimaryBg; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isConflict ? 'rgba(255, 77, 79, 0.06)' : token.colorBgLayout; }}
      >
        {/* Color bar */}
        <div style={{ width: 4, height: 40, borderRadius: 2, background: STATUS_COLORS[b.status], flexShrink: 0 }} />

        {/* Asset name */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <Text strong style={{ fontSize: 13, display: 'block' }}>{b.assetName}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{b.projectName}</Text>
        </div>

        {/* Status */}
        <Tag color={b.status === 'confirmed' ? 'blue' : b.status === 'checked-out' ? 'green' : b.status === 'pending' ? 'orange' : 'default'}>
          {STATUS_LABELS[b.status]}
        </Tag>

        {/* Checked out by */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {b.checkedOutBy ? (
            <Text style={{ fontSize: 11 }}>By: {b.checkedOutBy}</Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
          )}
        </div>

        {/* Date range */}
        <div style={{ flex: 1.5, minWidth: 0 }}>
          <Text style={{ fontSize: 11 }}>{b.startDate} → {b.endDate}</Text>
        </div>

        {/* Condition */}
        <div style={{ flex: 0.8, minWidth: 0 }}>
          <Text style={{ fontSize: 11 }}>{b.condition || '—'}</Text>
        </div>

        {/* Conflict indicator */}
        {isConflict && (
          <Tooltip title="Conflicts with another booking">
            <WarningOutlined style={{ color: token.colorError, fontSize: 15 }} />
          </Tooltip>
        )}
      </div>
    );
  };

  // ---- RENDER: Month View ----
  const renderMonthView = () => (
    <Card styles={{ body: { padding: 0 } }}>
      {/* Day names header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        {dayNames.map(d => (
          <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: token.colorTextSecondary, background: token.colorBgLayout }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} style={{ minHeight: 110, background: token.colorBgLayout, borderRight: `1px solid ${token.colorBorderSecondary}`, borderBottom: `1px solid ${token.colorBorderSecondary}` }} />
        ))}

        {/* Actual day cells */}
        {calendarDays.map(({ day, bookings: cellBookings }) => {
          const hasConflict = dayHasConflict(cellBookings);
          const todayHighlight = isToday(day);

          return (
            <div
              key={day}
              style={{
                minHeight: 110,
                padding: 6,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: hasConflict ? 'rgba(255, 77, 79, 0.04)' : todayHighlight ? token.colorPrimaryBg : token.colorBgContainer,
                position: 'relative',
              }}
            >
              {/* Day number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: todayHighlight ? token.colorPrimary : 'transparent',
                  color: todayHighlight ? '#fff' : token.colorText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: todayHighlight ? 700 : 400,
                }}>
                  {day}
                </div>
                {hasConflict && (
                  <Tooltip title="Booking conflict on this day">
                    <WarningOutlined style={{ color: token.colorError, fontSize: 13 }} />
                  </Tooltip>
                )}
              </div>

              {/* Booking pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cellBookings.slice(0, 3).map(b => renderBookingPill(b, day, month))}
                {renderMorePopover(cellBookings, 3, day, month)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  // ---- RENDER: Week View ----
  const renderWeekView = () => (
    <Card styles={{ body: { padding: 0 } }}>
      {/* Day names header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        {weekDays.map((wd, i) => {
          const dayData = wd === undefined ? null : weekDayNames[i];
          const dateObj = weekDays[i]?.date;
          return (
            <div key={i} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: token.colorTextSecondary, background: token.colorBgLayout }}>
              {weekDayNames[i]}
              {dateObj && <span style={{ fontWeight: 400, marginLeft: 4 }}>{dateObj.getDate()}</span>}
            </div>
          );
        })}
      </div>

      {/* Week cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {weekDays.map((wd, i) => {
          const hasConflict = dayHasConflict(wd.bookings);
          const todayHighlight = isToday(wd.day, wd.month, wd.year);
          const maxPills = 6;

          return (
            <div
              key={i}
              style={{
                minHeight: 200,
                padding: 6,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: hasConflict ? 'rgba(255, 77, 79, 0.04)' : todayHighlight ? token.colorPrimaryBg : token.colorBgContainer,
                position: 'relative',
              }}
            >
              {/* Day number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: todayHighlight ? token.colorPrimary : 'transparent',
                  color: todayHighlight ? '#fff' : token.colorText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: todayHighlight ? 700 : 400,
                }}>
                  {wd.day}
                </div>
                {hasConflict && (
                  <Tooltip title="Booking conflict on this day">
                    <WarningOutlined style={{ color: token.colorError, fontSize: 13 }} />
                  </Tooltip>
                )}
              </div>

              {/* Booking pills — up to 6 in week view */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(groupByAsset
                  ? wd.bookings.slice().sort((a, b) => (a.assetName || '').localeCompare(b.assetName || ''))
                  : wd.bookings
                ).slice(0, maxPills).map(b => renderBookingPill(b, wd.day, wd.month))}
                {renderMorePopover(wd.bookings, maxPills, wd.day, wd.month)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  // ---- RENDER: Day View ----
  const renderDayView = () => {
    const hasConflict = dayHasConflict(dayBookings);
    const sortedBookings = groupByAsset
      ? dayBookings.slice().sort((a, b) => (a.assetName || '').localeCompare(b.assetName || ''))
      : dayBookings;
    const grouped = groupByAsset ? groupBookingsByAsset(sortedBookings) : null;

    return (
      <Card styles={{ body: { padding: '16px' } }}>
        {hasConflict && (
          <div style={{ marginBottom: 12, padding: '6px 12px', background: 'rgba(255, 77, 79, 0.06)', border: '1px solid #ff4d4f', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: token.colorError }} />
            <Text style={{ color: token.colorError, fontSize: 12 }}>There are booking conflicts on this day</Text>
          </div>
        )}

        {dayBookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CalendarOutlined style={{ fontSize: 36, color: token.colorTextQuaternary }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">No bookings for this day</Text>
            </div>
          </div>
        )}

        {/* Grouped by asset */}
        {grouped ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {grouped.map(([assetName, bookings]) => (
              <div key={assetName}>
                <div style={{ marginBottom: 8, padding: '4px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                  <Text strong style={{ fontSize: 13 }}>{assetName}</Text>
                  <Badge count={bookings.length} style={{ marginLeft: 8, backgroundColor: token.colorPrimary }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bookings.map(b => renderDayViewBookingRow(b))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sortedBookings.map(b => renderDayViewBookingRow(b))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Asset Booking Calendar</Title>
          <Text type="secondary">View when assets are going out and coming in. Conflicts are highlighted.</Text>
        </div>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Total Bookings</Text>
                <Text strong style={{ fontSize: 18 }}>{stats.total}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ExportOutlined style={{ fontSize: 18, color: '#1677ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Going Out</Text>
                <Text strong style={{ fontSize: 18 }}>{stats.goingOut}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImportOutlined style={{ fontSize: 18, color: '#52c41a' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Coming In</Text>
                <Text strong style={{ fontSize: 18 }}>{stats.comingIn}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WarningOutlined style={{ fontSize: 18, color: stats.conflicts > 0 ? token.colorError : token.colorSuccess }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Conflicts</Text>
                <Text strong style={{ fontSize: 18, color: stats.conflicts > 0 ? token.colorError : token.colorSuccess }}>{stats.conflicts}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={handlePrev} size="small" />
            <Text strong style={{ fontSize: 16, minWidth: 200, textAlign: 'center', display: 'inline-block' }}>{headerLabel}</Text>
            <Button icon={<RightOutlined />} onClick={handleNext} size="small" />
            <Button size="small" onClick={goToToday}>Today</Button>
          </Space>
          <Space>
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as 'month' | 'week' | 'day')}
              options={[
                { label: 'Month', value: 'month' },
                { label: 'Week', value: 'week' },
                { label: 'Day', value: 'day' },
              ]}
              size="small"
            />
            {(viewMode === 'week' || viewMode === 'day') && (
              <Space size={4}>
                <Text style={{ fontSize: 12 }}>Group by Asset</Text>
                <Switch size="small" checked={groupByAsset} onChange={setGroupByAsset} />
              </Space>
            )}
            <Select
              placeholder="All Assets"
              allowClear
              value={assetFilter}
              onChange={val => setAssetFilter(val || null)}
              style={{ width: 260 }}
              options={MOCK_ASSETS.map(a => ({ label: a.name, value: a.id }))}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
            <Select
              placeholder="All Statuses"
              allowClear
              value={statusFilter}
              onChange={val => setStatusFilter(val || null)}
              style={{ width: 150 }}
              options={[
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Checked Out', value: 'checked-out' },
                { label: 'Returned', value: 'returned' },
                { label: 'Pending', value: 'pending' },
              ]}
            />
          </Space>
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Legend + Conflict Summary */}
      <Card style={{ marginTop: 16 }} styles={{ body: { padding: '12px 16px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: STATUS_COLORS.confirmed }} />
              <Text style={{ fontSize: 12 }}>Confirmed</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: STATUS_COLORS['checked-out'] }} />
              <Text style={{ fontSize: 12 }}>Checked Out</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: STATUS_COLORS.returned }} />
              <Text style={{ fontSize: 12 }}>Returned</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: STATUS_COLORS.pending }} />
              <Text style={{ fontSize: 12 }}>Pending</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: '2px solid #ff4d4f', background: 'rgba(255,77,79,0.1)' }} />
              <Text style={{ fontSize: 12 }}>Conflict</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12 }}>▶ Start</Text>
              <Text style={{ fontSize: 12 }}>◀ End</Text>
            </div>
          </Space>
          {allConflicts.length > 0 && (
            <Tooltip
              title={
                <div style={{ fontSize: 11 }}>
                  {allConflicts.map((c, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      <strong>{c.booking1.assetName}</strong>: {c.booking1.projectName} ({c.booking1.startDate}–{c.booking1.endDate}) ↔ {c.booking2.projectName} ({c.booking2.startDate}–{c.booking2.endDate})
                    </div>
                  ))}
                </div>
              }
              overlayStyle={{ maxWidth: 450 }}
            >
              <Tag color="error" icon={<WarningOutlined />} style={{ cursor: 'help' }}>
                {allConflicts.length} conflict{allConflicts.length !== 1 ? 's' : ''} — hover for details
              </Tag>
            </Tooltip>
          )}
        </div>
      </Card>

      {/* Modal for day detail (when clicking +N more) — kept as backup */}
      <Modal
        open={dayModalBookings !== null}
        title={`Bookings for ${dayModalDate}`}
        onCancel={() => setDayModalBookings(null)}
        footer={null}
        width={500}
      >
        {dayModalBookings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
            {dayModalBookings.map(b => renderDayViewBookingRow(b))}
          </div>
        )}
      </Modal>
    </div>
  );
};
