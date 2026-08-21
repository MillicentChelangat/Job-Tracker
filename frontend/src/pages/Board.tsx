import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { applicationsApi } from '../api/applications';
import type { Application, ApplicationStatus } from '../types/job';

const COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'wishlist', label: 'Wishlist', color: '#9CA3AF' },
  { status: 'applied', label: 'Applied', color: '#7C3AED' },
  { status: 'interview', label: 'Interview', color: '#EF9F27' },
  { status: 'offer', label: 'Offer', color: '#639922' },
  { status: 'rejected', label: 'Rejected', color: '#E24B4A' },
];

function BoardCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { app },
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="board-card">
      <p className="board-card-position">{app.position}</p>
      <p className="board-card-company">{app.company_name}</p>
      {app.salary && <p className="board-card-salary">{app.salary}</p>}
      <Link
        to={`/jobs/${app.id}`}
        className="board-card-link"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        View →
      </Link>
    </div>
  );
}

function BoardColumn({
  status, label, color, apps,
}: { status: ApplicationStatus; label: string; color: string; apps: Application[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`board-column ${isOver ? 'board-column-over' : ''}`}>
      <div className="board-column-header">
        <span className="board-column-dot" style={{ background: color }} />
        <span>{label}</span>
        <span className="board-column-count">{apps.length}</span>
      </div>
      <div className="board-column-body">
        {apps.length === 0 ? (
          <p className="board-column-empty">Drop cards here</p>
        ) : (
          apps.map((app) => <BoardCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  );
}

export default function Board() {
  const qc = useQueryClient();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', 'board'],
    queryFn: () => applicationsApi.getAll({ page: 1 }).then((r) => r.data.results),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      applicationsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveApp(event.active.data.current?.app ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as ApplicationStatus;
    const app = active.data.current?.app as Application;
    if (app && app.status !== newStatus) {
      updateStatus.mutate({ id: app.id, status: newStatus });
    }
  }

  if (isLoading) return <div className="page-loading">Loading board…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Board</h1>
          <p className="page-subtitle">Drag cards between columns to update status.</p>
        </div>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board-grid">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              apps={(applications ?? []).filter((a) => a.status === col.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp ? (
            <div className="board-card board-card-overlay">
              <p className="board-card-position">{activeApp.position}</p>
              <p className="board-card-company">{activeApp.company_name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}