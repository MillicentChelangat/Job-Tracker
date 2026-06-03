import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { jobsApi } from '../api/jobs';
import StatusBadge from '../components/StatusBadge';
import type { JobStatus } from '../types/job';

const STATUS_COLORS: Record<JobStatus, string> = {
  applied:   '#7C3AED',
  interview: '#EF9F27',
  offer:     '#639922',
  rejected:  '#E24B4A',
};

const STATUS_ORDER: JobStatus[] = ['applied', 'interview', 'offer', 'rejected'];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday-first
  const cells: { day: number; type: 'prev' | 'cur' | 'next' }[] = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur' });
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, type: 'next' });
  return cells;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => jobsApi.getStats().then((r) => r.data),
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['jobs', 'recent'],
    queryFn: () => jobsApi.getAll({ ordering: '-created_at', page: 1 }).then((r) => r.data.results.slice(0, 4)),
  });

  const today = new Date();
  const calCells = buildCalendar(today.getFullYear(), today.getMonth());

  if (isLoading) return <div className="page-loading">Loading dashboard…</div>;

  const total = stats?.total ?? 0;
  const offered = stats?.by_status?.offer ?? 0;
  const interviewed = stats?.by_status?.interview ?? 0;
  const applied = stats?.by_status?.applied ?? 0;
  const rejected = stats?.by_status?.rejected ?? 0;

  const offerRate = total ? Math.round((offered / total) * 100) : 0;
  const interviewRate = total ? Math.round(((interviewed + offered) / total) * 100) : 0;
  const activePct = total ? Math.round(((applied + interviewed) / total) * 100) : 0;

  // Donut arc for "weekly activity" style — we repurpose as interview rate
  const R = 54;
  const C = 2 * Math.PI * R;
  const dashOffset = C - (C * interviewRate) / 100;

  const barData = STATUS_ORDER.map((s) => ({
    status: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    count: stats?.by_status?.[s] ?? 0,
    color: STATUS_COLORS[s],
  }));

  const statCards = [
    { label: 'Total Applications', value: total, delta: '+' + applied + ' applied', positive: true, accent: '#7C3AED' },
    { label: 'In Interview', value: interviewed, delta: interviewed > 0 ? 'Active' : 'None yet', positive: interviewed > 0, accent: '#EF9F27' },
    { label: 'Offers Received', value: offered, delta: `${offerRate}% offer rate`, positive: offerRate > 0, accent: '#639922' },
  ];

  return (
    <div className="dash">

      {/* ── Row 1: Stat Cards ── */}
      <div className="dash-stats">
        {statCards.map(({ label, value, delta, positive, accent }) => (
          <div key={label} className="dcard stat-card-new">
           
            <p className="sn-label">{label}</p>
            <p className="sn-value" style={{ color: accent }}>{value}</p>
            <p className={`sn-delta ${positive ? 'pos' : 'neg'}`}>{delta}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Main Grid ── */}
      <div className="dash-main">

        {/* Center col: Activity donut + Bar chart */}
        <div className="dash-center">
          {/* Activity card */}
          <div className="dcard activity-card">
            <h3 className="dcard-title">Interview Rate</h3>
            <div className="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={R} fill="none" stroke="#f3e8ff" strokeWidth="14"/>
                <circle
                  cx="70" cy="70" r={R}
                  fill="none"
                  stroke="url(#donutGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#7621C2"/>
                    <stop offset="1" stopColor="#A54DF3"/>
                  </linearGradient>
                </defs>
                <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1a1917" fontFamily="DM Sans, sans-serif">
                  {interviewRate}%
                </text>
                <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#6b6a66" fontFamily="DM Sans, sans-serif">
                  of applications
                </text>
              </svg>
            </div>
            <div className="activity-stats">
              <div className="act-stat"><span className="act-num" style={{color:'#7C3AED'}}>{interviewed}</span><span className="act-lbl">Interviews</span></div>
              <div className="act-divider" />
              <div className="act-stat"><span className="act-num" style={{color:'#639922'}}>{offered}</span><span className="act-lbl">Offers</span></div>
              <div className="act-divider" />
              <div className="act-stat"><span className="act-num" style={{color:'#E24B4A'}}>{rejected}</span><span className="act-lbl">Rejected</span></div>
            </div>
          </div>

          {/* Bar chart card */}
          <div className="dcard barchart-card">
            <h3 className="dcard-title">Applications by Status</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barData} barSize={26} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#6b6a66' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b6a66' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(124,58,237,0.06)' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e3dd', fontSize: 12 }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right col: Calendar + Recent */}
        <div className="dash-right">
          {/* Calendar */}
          <div className="dcard calendar-card">
            <div className="cal-header">
              <button className="cal-nav">‹</button>
              <span className="cal-month">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</span>
              <button className="cal-nav">›</button>
            </div>
            <div className="cal-grid">
              {DAYS.map((d, i) => (
                <div key={i} className="cal-day-label">{d}</div>
              ))}
              {calCells.map((cell, i) => (
                <div
                  key={i}
                  className={`cal-cell ${cell.type !== 'cur' ? 'cal-muted' : ''} ${cell.type === 'cur' && cell.day === today.getDate() ? 'cal-today' : ''}`}
                >
                  {cell.day}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="dcard recent-card">
            <div className="recent-header">
              <h3 className="dcard-title">Recent Applications</h3>
              <Link to="/jobs" className="card-link">View all →</Link>
            </div>
            {!recentJobs?.length ? (
              <p className="empty-state">No applications yet. <Link to="/jobs/new">Add one!</Link></p>
            ) : (
              <ul className="recent-dash-list">
                {recentJobs.map((job) => (
                  <li key={job.id} className="recent-dash-item">
                    <div className="company-avatar sm">{job.company[0]}</div>
                    <div className="recent-info">
                      <p className="recent-role">{job.role}</p>
                      <p className="recent-company">{job.company}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}