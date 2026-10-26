import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TimelineFormProps {
  readonly onAdd: (title: string, time: string) => void;
}

export function useTimelineForm(onAdd: (title: string, time: string) => void) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a milestone title.');
      return;
    }
    setError('');
    onAdd(title.trim(), time);
    setTitle('');
  };

  return { title, setTitle, time, setTime, error, setError, handleSubmit };
}

export function TimelineForm({ onAdd }: TimelineFormProps): React.JSX.Element {
  const { title, setTitle, time, setTime, error, setError, handleSubmit } = useTimelineForm(onAdd);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '20px',
      }}
    >
      <div>
        <label htmlFor="timeline-item-title" className="sr-only">
          Milestone title
        </label>
        <input
          id="timeline-item-title"
          className="input"
          placeholder="Add custom milestone (e.g. Ring Exchange)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'timeline-form-error' : undefined}
          required
        />
        {error && (
          <p
            id="timeline-form-error"
            role="alert"
            aria-live="assertive"
            style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '4px' }}
          >
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="timeline-item-time" className="sr-only">
          Milestone time
        </label>
        <input
          id="timeline-item-time"
          type="time"
          className="input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ width: '130px' }}
          required
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        leftIcon={<Plus size={16} />}
        id="btn-add-timeline-item"
      >
        Add
      </Button>
    </form>
  );
}
