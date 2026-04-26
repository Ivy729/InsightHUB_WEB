import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = ({ staffList, kpiList }) => {
  const [achievementChart, setAchievementChart] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [notifications, setNotifications] = useState([]);

  const achievementData = {
    month: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      achieved: [3, 5, 4, 6, 5, 7, 6, 8],
      inProgress: [2, 2, 3, 2, 3, 2, 3, 2],
      overdue: [1, 0, 1, 1, 0, 1, 0, 1]
    },
    quarter: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      achieved: [12, 16, 18, 10],
      inProgress: [5, 6, 7, 4],
      overdue: [2, 2, 1, 3]
    },
    year: {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      achieved: [30, 38, 45, 52, 48],
      inProgress: [10, 12, 14, 16, 14],
      overdue: [5, 4, 6, 3, 5]
    }
  };

  const chartData = achievementData[selectedTimeframe];

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Achieved',
        data: chartData.achieved,
        backgroundColor: '#1db87a',
        borderRadius: 6
      },
      {
        label: 'In Progress',
        data: chartData.inProgress,
        backgroundColor: '#e8a020',
        borderRadius: 6
      },
      {
        label: 'Overdue',
        data: chartData.overdue,
        backgroundColor: '#e53e3e',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          beginAtZero: true,
          stepSize: 5
        }
      }
    }
  };

  const totalKpis = kpiList.length;
  const achievedKpis = kpiList.filter(k => k.status === 'achieved').length;
  const inProgressKpis = kpiList.filter(k => k.status === 'in-progress').length;
  const overdueKpis = kpiList.filter(k => k.status === 'overdue').length;

  const completionRate = totalKpis > 0 ? Math.round((achievedKpis / totalKpis) * 100) : 0;

  const tableHeaderStyle = {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7a99',
    padding: '10px 14px',
  };

  const getStatusPillStyle = (status) => {
    const styleMap = {
      achieved: { background: 'rgba(29,184,122,0.12)', color: '#1db87a', label: 'Achieved' },
      'in-progress': { background: 'rgba(232,160,32,0.12)', color: '#f5a623', label: 'In Progress' },
      overdue: { background: 'rgba(229,62,62,0.1)', color: '#e53e3e', label: 'Overdue' },
    };

    return styleMap[status] || styleMap.overdue;
  };

  return (
    <div>
      {/* STAT CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard icon="bi-list-check" color="blue" value={totalKpis} label="Total KPIs" change={`+${Math.max(0, Math.floor(Math.random() * 5))} this month`} />
        <StatCard icon="bi-check-circle-fill" color="green" value={achievedKpis} label="Achieved" change={`${completionRate}% completion rate`} />
        <StatCard icon="bi-arrow-repeat" color="gold" value={inProgressKpis} label="In Progress" change="On track" />
        <StatCard icon="bi-exclamation-triangle-fill" color="red" value={overdueKpis} label="Overdue" change="Needs attention" />
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* OVERVIEW CARD */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
              KPI Achievement Overview
            </span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div style={{ padding: '18px 22px', height: '300px' }}>
            <Bar data={chartConfig} options={chartOptions} />
          </div>
        </div>

        {/* PERFORMANCE SUMMARY CARD */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
              Performance Summary
            </span>
          </div>
          <div style={{ padding: '18px 22px' }}>
            <div style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '8px' }}>Completion Rate</div>
              <div style={{ fontSize: '32px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#1a3a5c', marginBottom: '4px' }}>
                {completionRate}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7a99' }}>
                {achievedKpis} of {totalKpis} KPIs achieved
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#6b7a99' }}>Achieved</span>
                <span style={{ fontWeight: 600, color: '#1db87a' }}>{achievedKpis}</span>
              </div>
              <div style={{ height: '4px', background: '#f4f6fb', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${totalKpis > 0 ? (achievedKpis / totalKpis) * 100 : 0}%`,
                  background: '#1db87a',
                  borderRadius: '20px'
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#6b7a99' }}>In Progress</span>
                <span style={{ fontWeight: 600, color: '#e8a020' }}>{inProgressKpis}</span>
              </div>
              <div style={{ height: '4px', background: '#f4f6fb', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${totalKpis > 0 ? (inProgressKpis / totalKpis) * 100 : 0}%`,
                  background: '#e8a020',
                  borderRadius: '20px'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#6b7a99' }}>Overdue</span>
                <span style={{ fontWeight: 600, color: '#e53e3e' }}>{overdueKpis}</span>
              </div>
              <div style={{ height: '4px', background: '#f4f6fb', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${totalKpis > 0 ? (overdueKpis / totalKpis) * 100 : 0}%`,
                  background: '#e53e3e',
                  borderRadius: '20px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI TABLE */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
            Active KPIs
          </span>
        </div>
        <div style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
                <th style={tableHeaderStyle}>#</th>
                <th style={tableHeaderStyle}>KPI Title</th>
                <th style={tableHeaderStyle}>Staff</th>
                <th style={tableHeaderStyle}>Department</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.slice(0, 4).map((kpi, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.num}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <strong>{kpi.title}</strong><br />
                    <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.desc}</span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.staff}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.dept}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    {(() => {
                      const statusStyle = getStatusPillStyle(kpi.status);
                      return (
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: statusStyle.background,
                      color: statusStyle.color
                    }}>
                      {statusStyle.label}
                    </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, value, label, change }) => {
  const colors = {
    blue: { bg: 'rgba(26,58,92,0.1)', text: '#1a3a5c', after: '#1a3a5c' },
    green: { bg: 'rgba(29,184,122,0.1)', text: '#1db87a', after: '#1db87a' },
    gold: { bg: '#fdf3e0', text: '#e8a020', after: '#e8a020' },
    red: { bg: 'rgba(229,62,62,0.1)', text: '#e53e3e', after: '#e53e3e' }
  };

  const colorScheme = colors[color] || colors.blue;

  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '20px 22px',
      border: '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '60px',
        borderRadius: '0 14px 0 60px',
        background: colorScheme.after,
        opacity: 0.07
      }}></div>

      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        marginBottom: '14px',
        background: colorScheme.bg,
        color: colorScheme.text
      }}>
        <i className={`bi ${icon}`}></i>
      </div>

      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '30px',
        fontWeight: 700,
        color: '#1a2233'
      }}>
        {value}
      </div>

      <div style={{ fontSize: '13px', color: '#6b7a99', marginTop: '2px' }}>
        {label}
      </div>

      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        marginTop: '8px',
        color: color === 'red' ? '#e53e3e' : '#1db87a'
      }}>
        <i className={`bi ${color === 'red' ? 'bi-arrow-down-short' : 'bi-arrow-up-short'}`}></i>
        {change}
      </div>
    </div>
  );
};

export default DashboardPage;
