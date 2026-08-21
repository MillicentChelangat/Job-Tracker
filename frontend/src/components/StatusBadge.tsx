import type { ApplicationStatus } from '../types/job';

const config: Record<ApplicationStatus, { label: string; className: string }> = {
  wishlist:  { label: 'Wishlist',  className: 'badge-wishlist' },
  applied:   { label: 'Applied',   className: 'badge-applied' },
  interview: { label: 'Interview', className: 'badge-interview' },
  offer:     { label: 'Offer',     className: 'badge-offer' },
  rejected:  { label: 'Rejected',  className: 'badge-rejected' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}