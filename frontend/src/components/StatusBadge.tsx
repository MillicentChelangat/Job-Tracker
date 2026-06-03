import type { JobStatus } from '../types/job';

const config: Record<JobStatus, { label: string; className: string }> = {
  applied:   { label: 'Applied',   className: 'badge-applied' },
  interview: { label: 'Interview', className: 'badge-interview' },
  offer:     { label: 'Offer',     className: 'badge-offer' },
  rejected:  { label: 'Rejected',  className: 'badge-rejected' },
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}