import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { applicationsApi } from '../api/applications';
import StatusBadge from '../components/StatusBadge';
import type { ApplicationStatus } from '../types/job';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied:   '#7C3AED',
  interview: '#EF9F27',
  offer:     '#639922',
  rejected:  '#E24B4A',
};

const STATUS_ORDER: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected'];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const offset = (firstDay + 6) % 7;
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
    queryFn: () => applicationsApi.getStats().then((r) => r.data),
  });

  const { data: recentApplications } = useQuery({
    queryKey: ['applications', 'recent'],
    queryFn: () => applicationsApi.getAll({ ordering: '-created_at', page: 1 }).then((r) => r.data.results.slice(0, 4)),
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
      <div className="dash-stats">
            {statCards.map(({ label, value, delta, positive, accent }) => (
              <div key={label} className="dcard stat-card-new">
            <p className="sn-label">{label}</p>
            <p className="sn-value" style={{ color: accent }}>{value}</p>
            <p className={`sn-delta ${positive ? 'pos' : 'neg'}`}>{delta}</p>
          </div>
        ))}
      </div>

      <div className="dash-main">
        <div className="dash-center">
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

          <div className="dcard barchart-card">
            <h3 className="dcard-title">Application Pipeline</h3>
            {total === 0 ? (
              <div className="chart-empty-state">
                <p>No applications yet — this fills in once you add your first one.</p>
                <Link to="/jobs/new" className="btn btn-primary btn-sm">+ Add Application</Link>
              </div>
            ) : (
              <div className="pipeline-bars">
                {[
                  { status: 'wishlist', label: 'Wishlist', color: '#9CA3AF' },
                  { status: 'applied', label: 'Applied', color: '#7C3AED' },
                  { status: 'interview', label: 'Interview', color: '#EF9F27' },
                  { status: 'offer', label: 'Offer', color: '#639922' },
                  { status: 'rejected', label: 'Rejected', color: '#E24B4A' },
                ].map(({ status, label, color }) => {
                  const count = stats?.by_status?.[status as ApplicationStatus] ?? 0;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status} className="pipeline-row">
                      <span className="pipeline-label">{label}</span>
                      <div className="pipeline-track">
                        <div
                          className="pipeline-fill"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <span className="pipeline-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="dash-right">
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

          <div className="dcard recent-card">
            <div className="recent-header">
              <h3 className="dcard-title">Recent Applications</h3>
              <Link to="/jobs" className="card-link">View all →</Link>
            </div>
            {!recentApplications?.length ? (
              <p className="empty-state">No applications yet. <Link to="/jobs/new">Add one!</Link></p>
            ) : (
              <ul className="recent-dash-list">
                {recentApplications.map((app) => (
                  <li key={app.id} className="recent-dash-item">
                    <div className="company-avatar sm">{app.company_name[0]}</div>
                    <div className="recent-info">
                      <p className="recent-role">{app.position}</p>
                      <p className="recent-company">{app.company_name}</p>
                    </div>
                    <StatusBadge status={app.status} />
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