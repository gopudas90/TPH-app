// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Typography, Tooltip, Switch, Tag } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { theme } from 'antd';
import type { Milestone, Task } from '../../data/projectMockData';

const { Text } = Typography;

const DAY_WIDTH = 28;

const daysBetween = (start: string | Date, end: string | Date): number => {
  const s = new Date(typeof start === 'string' ? start : start);
  const e = new Date(typeof end === 'string' ? end : end);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (date: string, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (d: Date): string => {
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
};

interface GanttChartProps {
  milestones: Milestone[];
  projectStartDate: string;
  projectEndDate: string;
  eventDate: string;
}

const statusOpacity: Record<string, number> = {
  'Not Started': 0.4,
  'In Progress': 0.85,
  'Completed': 1.0,
  'Blocked': 0.6,
  'Pending Approval': 0.7,
  'At Risk': 0.7,
};

const priorityColor: Record<string, string> = {
  'Low': '#52c41a',
  'Medium': '#1677ff',
  'High': '#fa8c16',
  'Critical': '#ff4d4f',
};

export const GanttChart: React.FC<GanttChartProps> = ({
  milestones,
  projectStartDate,
  projectEndDate,
  eventDate,
}) => {
  const { token } = theme.useToken();
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(milestones.map(m => m.id))
  );
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Build task lookup map from milestones
  const allTasksById: Record<string, Task> = {};
  milestones.forEach(m => m.tasks.forEach(t => { allTasksById[t.id] = t; }));

  // Compute row positions for dependency arrows (recalculated on expand/collapse)
  const taskRowMap: Record<string, number> = {};
  let totalRowCount = 0;
  milestones.forEach(m => {
    totalRowCount++; // milestone row
    if (expandedMilestones.has(m.id)) {
      m.tasks.forEach(t => {
        taskRowMap[t.id] = totalRowCount;
        totalRowCount++;
      });
    }
  });

  const totalDays = daysBetween(projectStartDate, projectEndDate) + 1;
  const timelineWidth = totalDays * DAY_WIDTH;

  // Generate all dates from start to end
  const allDates: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    allDates.push(addDays(projectStartDate, i));
  }

  // Group by month
  const monthGroups: Array<{ label: string; startIdx: number; count: number }> = [];
  let currentMonth = '';
  let monthStart = 0;
  allDates.forEach((d, idx) => {
    const monthLabel = d.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
    if (monthLabel !== currentMonth) {
      if (currentMonth !== '') {
        monthGroups.push({ label: currentMonth, startIdx: monthStart, count: idx - monthStart });
      }
      currentMonth = monthLabel;
      monthStart = idx;
    }
  });
  if (currentMonth) {
    monthGroups.push({ label: currentMonth, startIdx: monthStart, count: allDates.length - monthStart });
  }

  // Generate week markers every 7 days
  const weekMarkers: Array<{ idx: number; label: string }> = [];
  for (let i = 0; i < totalDays; i += 7) {
    weekMarkers.push({
      idx: i,
      label: formatDate(allDates[i]),
    });
  }

  const today = new Date();
  const todayOffset = daysBetween(projectStartDate, today);
  const eventOffset = daysBetween(projectStartDate, eventDate);

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      if (next.has(milestoneId)) {
        next.delete(milestoneId);
      } else {
        next.add(milestoneId);
      }
      return next;
    });
  };

  const getBarOpacity = (task: Task) => {
    if (showCriticalPath && !task.isCriticalPath) return 0.2;
    return statusOpacity[task.status] || 0.8;
  };

  const getBarColor = (task: Task) => {
    if (showCriticalPath && !task.isCriticalPath) return token.colorTextDisabled;
    if (task.isCriticalPath) return '#ff4d4f';
    return priorityColor[task.priority] || token.colorPrimary;
  };

  const rowHeight = 36;
  const headerHeight = 56;
  const svgHeight = headerHeight + totalRowCount * rowHeight;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <Text style={{ fontSize: 13 }}>Critical Path</Text>
          <Switch size="small" checked={showCriticalPath} onChange={setShowCriticalPath} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: token.colorTextSecondary }} />
          <Text style={{ fontSize: 13 }}>Show Baseline</Text>
          <Switch size="small" checked={showBaseline} onChange={setShowBaseline} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LinkOutlined style={{ color: token.colorTextSecondary }} />
          <Text style={{ fontSize: 13 }}>Dependencies</Text>
          <Switch size="small" checked={showDependencies} onChange={setShowDependencies} />
        </div>
      </div>

      {/* Gantt Container */}
      <div style={{ display: 'flex', border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ width: 300, minWidth: 300, flexShrink: 0, borderRight: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer }}>
          {/* Left Header */}
          <div style={{
            height: headerHeight,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgLayout,
          }}>
            <Text strong style={{ fontSize: 12, color: token.colorTextSecondary }}>MILESTONE / TASK</Text>
          </div>

          {/* Left Rows */}
          {milestones.map(milestone => (
            <div key={milestone.id}>
              {/* Milestone Row */}
              <div
                style={{
                  height: rowHeight,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  background: `${milestone.color}15`,
                  gap: 6,
                }}
                onClick={() => toggleMilestone(milestone.id)}
              >
                {expandedMilestones.has(milestone.id)
                  ? <CaretDownOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                  : <CaretRightOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                }
                <div style={{ width: 8, height: 8, borderRadius: 2, background: milestone.color, flexShrink: 0 }} />
                <Text style={{ fontSize: 12, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {milestone.name}
                </Text>
                <Tag
                  style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '16px' }}
                  color={
                    milestone.status === 'Completed' ? 'success' :
                    milestone.status === 'In Progress' ? 'processing' :
                    milestone.status === 'At Risk' ? 'warning' : 'default'
                  }
                >
                  {milestone.status}
                </Tag>
              </div>

              {/* Task Rows */}
              {expandedMilestones.has(milestone.id) && milestone.tasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    height: rowHeight,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px 0 28px',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    gap: 6,
                    opacity: showCriticalPath && !task.isCriticalPath ? 0.4 : 1,
                  }}
                >
                  {task.isCriticalPath && (
                    <Tooltip title="Critical Path">
                      <FireOutlined style={{ fontSize: 10, color: '#ff4d4f', flexShrink: 0 }} />
                    </Tooltip>
                  )}
                  <Text style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.name}
                  </Text>
                  {task.dependencies.length > 0 && (() => {
                    const unresolved = task.dependencies.filter(id => allTasksById[id] && allTasksById[id].status !== 'Completed');
                    return (
                      <Tooltip title={`Depends on ${task.dependencies.length} task${task.dependencies.length > 1 ? 's' : ''}${unresolved.length > 0 ? ` · ${unresolved.length} unresolved` : ''}`}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0,
                          padding: '0 4px', borderRadius: 3, fontSize: 10,
                          background: unresolved.length > 0 ? '#fff7e6' : token.colorFillSecondary,
                          border: `1px solid ${unresolved.length > 0 ? '#ffd591' : token.colorBorderSecondary}`,
                          color: unresolved.length > 0 ? '#fa8c16' : token.colorTextSecondary,
                        }}>
                          <LinkOutlined style={{ fontSize: 9 }} />
                          {task.dependencies.length}
                        </div>
                      </Tooltip>
                    );
                  })()}
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary, flexShrink: 0 }}>
                    {task.owner.split(' ').map(n => n[0]).join('')}
                  </Text>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Panel - Timeline */}
        <div style={{ flex: 1, overflow: 'auto' }} ref={timelineRef}>
          <div style={{ width: timelineWidth, position: 'relative' }}>
            {/* Header Row 1 - Months */}
            <div style={{
              height: 28,
              display: 'flex',
              background: token.colorBgLayout,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              {monthGroups.map((mg, idx) => (
                <div
                  key={idx}
                  style={{
                    width: mg.count * DAY_WIDTH,
                    flexShrink: 0,
                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 600, color: token.colorTextSecondary, whiteSpace: 'nowrap' }}>
                    {mg.label}
                  </Text>
                </div>
              ))}
            </div>

            {/* Header Row 2 - Weeks */}
            <div style={{
              height: 28,
              display: 'flex',
              background: token.colorBgLayout,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              position: 'sticky',
              top: 28,
              zIndex: 10,
            }}>
              {weekMarkers.map((wm, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: wm.idx * DAY_WIDTH,
                    width: 7 * DAY_WIDTH,
                    height: '100%',
                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, color: token.colorTextTertiary, whiteSpace: 'nowrap' }}>
                    {wm.label}
                  </Text>
                </div>
              ))}
            </div>

            {/* Today & Event Markers (absolute, full height) */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div style={{
                position: 'absolute',
                left: todayOffset * DAY_WIDTH,
                top: headerHeight,
                bottom: 0,
                width: 2,
                background: '#ff4d4f',
                zIndex: 5,
                pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  top: -headerHeight,
                  left: 2,
                  background: '#ff4d4f',
                  color: '#fff',
                  fontSize: 9,
                  padding: '1px 4px',
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                }}>
                  TODAY
                </div>
              </div>
            )}

            {eventOffset >= 0 && eventOffset <= totalDays && (
              <div style={{
                position: 'absolute',
                left: eventOffset * DAY_WIDTH,
                top: headerHeight,
                bottom: 0,
                width: 2,
                background: '#722ed1',
                zIndex: 5,
                borderLeft: '2px dashed #722ed1',
                pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  top: -headerHeight,
                  left: 2,
                  background: '#722ed1',
                  color: '#fff',
                  fontSize: 9,
                  padding: '1px 4px',
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                }}>
                  EVENT
                </div>
              </div>
            )}

            {/* Data Rows */}
            {milestones.map(milestone => {
              const mStart = Math.max(0, daysBetween(projectStartDate, milestone.startDate));
              const mEnd = Math.min(totalDays, daysBetween(projectStartDate, milestone.endDate));
              const mWidth = (mEnd - mStart) * DAY_WIDTH;

              return (
                <div key={milestone.id}>
                  {/* Milestone Bar Row */}
                  <div style={{
                    height: rowHeight,
                    position: 'relative',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    background: `${milestone.color}08`,
                  }}>
                    {/* Vertical gridlines */}
                    {weekMarkers.map((wm, idx) => (
                      <div key={idx} style={{
                        position: 'absolute',
                        left: wm.idx * DAY_WIDTH,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: token.colorBorderSecondary,
                        opacity: 0.4,
                      }} />
                    ))}
                    {/* Milestone span background */}
                    <div style={{
                      position: 'absolute',
                      left: mStart * DAY_WIDTH,
                      top: 4,
                      width: mWidth,
                      height: rowHeight - 8,
                      background: `${milestone.color}20`,
                      borderLeft: `3px solid ${milestone.color}`,
                      borderRadius: 2,
                    }} />
                  </div>

                  {/* Task Rows */}
                  {expandedMilestones.has(milestone.id) && milestone.tasks.map(task => {
                    const tStart = Math.max(0, daysBetween(projectStartDate, task.startDate));
                    const tEnd = Math.max(tStart + 1, daysBetween(projectStartDate, task.endDate) + 1);
                    const tWidth = Math.max(DAY_WIDTH, (tEnd - tStart) * DAY_WIDTH);
                    const barColor = getBarColor(task);
                    const barOpacity = getBarOpacity(task);

                    // Baseline bar (shifted slightly up, lighter)
                    const baselineOffset = showBaseline ? 2 : 0;

                    return (
                      <div key={task.id} style={{
                        height: rowHeight,
                        position: 'relative',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                      }}>
                        {/* Vertical gridlines */}
                        {weekMarkers.map((wm, idx) => (
                          <div key={idx} style={{
                            position: 'absolute',
                            left: wm.idx * DAY_WIDTH,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: token.colorBorderSecondary,
                            opacity: 0.3,
                          }} />
                        ))}

                        {/* Baseline bar */}
                        {showBaseline && (
                          <div style={{
                            position: 'absolute',
                            left: (tStart + 0.5) * DAY_WIDTH,
                            top: rowHeight / 2 - 2,
                            width: tWidth - DAY_WIDTH * 0.5,
                            height: 6,
                            background: token.colorBorderSecondary,
                            borderRadius: 3,
                            opacity: 0.5,
                          }} />
                        )}

                        {/* Task Bar */}
                        <Tooltip title={
                          <div>
                            <div><strong>{task.name}</strong></div>
                            <div>Owner: {task.owner}</div>
                            <div>Status: {task.status}</div>
                            <div>Priority: {task.priority}</div>
                            <div>{task.startDate} → {task.endDate}</div>
                            {task.isCriticalPath && <div style={{ color: '#ff4d4f' }}>⚡ Critical Path</div>}
                          </div>
                        }>
                          <div style={{
                            position: 'absolute',
                            left: tStart * DAY_WIDTH,
                            top: rowHeight / 2 - 9,
                            width: tWidth,
                            height: 18,
                            background: barColor,
                            opacity: barOpacity,
                            borderRadius: 3,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 4,
                            overflow: 'hidden',
                          }}>
                            {task.status === 'Completed' && (
                              <CheckCircleOutlined style={{ color: '#fff', fontSize: 10, marginRight: 3, flexShrink: 0 }} />
                            )}
                            {tWidth > 60 && (
                              <span style={{ color: '#fff', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.name}
                              </span>
                            )}
                          </div>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Dependency Arrows SVG Overlay */}
            {showDependencies && (
              <svg
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: timelineWidth, height: svgHeight,
                  pointerEvents: 'none', overflow: 'visible',
                }}
              >
                <defs>
                  <marker id="dep-open" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z" fill="#fa8c16" />
                  </marker>
                  <marker id="dep-done" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z" fill="#8c8c8c" />
                  </marker>
                </defs>
                {milestones.flatMap(m =>
                  expandedMilestones.has(m.id)
                    ? m.tasks.flatMap(task =>
                        task.dependencies
                          .filter(depId => taskRowMap[depId] !== undefined && taskRowMap[task.id] !== undefined)
                          .map(depId => {
                            const predTask = allTasksById[depId];
                            if (!predTask) return null;
                            const resolved = predTask.status === 'Completed';
                            const color = resolved ? '#8c8c8c' : '#fa8c16';

                            const x1 = (daysBetween(projectStartDate, predTask.endDate) + 1) * DAY_WIDTH;
                            const y1 = headerHeight + taskRowMap[predTask.id] * rowHeight + rowHeight / 2;
                            const x2 = Math.max(0, daysBetween(projectStartDate, task.startDate)) * DAY_WIDTH;
                            const y2 = headerHeight + taskRowMap[task.id] * rowHeight + rowHeight / 2;

                            const midX = x1 + 12;
                            const d = x2 > midX
                              ? `M ${x1},${y1} L ${midX},${y1} L ${midX},${y2} L ${x2},${y2}`
                              : `M ${x1},${y1} L ${x1 + 12},${y1} L ${x1 + 12},${Math.min(y1, y2) - 14} L ${x2 - 12},${Math.min(y1, y2) - 14} L ${x2 - 12},${y2} L ${x2},${y2}`;

                            return (
                              <path
                                key={`${depId}->${task.id}`}
                                d={d}
                                fill="none"
                                stroke={color}
                                strokeWidth={1.5}
                                strokeOpacity={resolved ? 0.35 : 0.75}
                                strokeDasharray={resolved ? '4 3' : undefined}
                                markerEnd={resolved ? 'url(#dep-done)' : 'url(#dep-open)'}
                              />
                            );
                          })
                      )
                    : []
                )}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 8, background: '#ff4d4f', borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Critical Path</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 8, background: '#1677ff', borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Normal Task</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 2, height: 16, background: '#ff4d4f' }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Today</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 2, height: 16, background: '#722ed1', borderLeft: '2px dashed #722ed1' }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Event Date</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 8, background: '#1677ff', opacity: 0.4, borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Not Started</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 8, background: '#1677ff', opacity: 0.85, borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>In Progress</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 8, background: '#1677ff', opacity: 1.0, borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Completed</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="24" height="12"><path d="M0,6 L18,6" stroke="#fa8c16" strokeWidth="1.5" /><path d="M14,3 L20,6 L14,9 z" fill="#fa8c16" /></svg>
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Dep (open)</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="24" height="12"><path d="M0,6 L18,6" stroke="#8c8c8c" strokeWidth="1.5" strokeDasharray="4 3" /><path d="M14,3 L20,6 L14,9 z" fill="#8c8c8c" /></svg>
          <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Dep (resolved)</Text>
        </div>
      </div>
    </div>
  );
};
