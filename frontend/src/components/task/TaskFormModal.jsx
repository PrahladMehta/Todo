import { useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Field } from '../ui/Field.jsx';
import { Input, Textarea } from '../ui/Input.jsx';
import { combineDateAndTime, inputDateValue, timeLabel } from '../../lib/week.js';

const PRIORITIES = ['low', 'medium', 'high'];

const emptyForm = (defaultDate) => ({
  title: '',
  date: inputDateValue(defaultDate ?? new Date()),
  startTime: '',
  endTime: '',
  priority: 'medium',
  description: '',
});

const formFromTask = (task) => ({
  title: task.title ?? '',
  date: inputDateValue(task.dueAt),
  startTime: task.startAt ? timeLabel(task.startAt) : '',
  endTime: task.endAt ? timeLabel(task.endAt) : '',
  priority: task.priority ?? 'medium',
  description: task.description ?? '',
});

const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (form.title.length > 200) errors.title = 'Title must be at most 200 characters';
  if (!form.date) errors.dueAt = 'A date is required';
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endAt = 'The end time must be after the start time';
  }
  return errors;
};

export const TaskFormModal = ({ onClose, task, defaultDate, onSubmit, submitting }) => {
  const [form, setForm] = useState(() => (task ? formFromTask(task) : emptyForm(defaultDate)));
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const dueAt = combineDateAndTime(form.date, form.startTime || '09:00');

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      dueAt: dueAt.toISOString(),
      priority: form.priority,
      startAt: form.startTime ? combineDateAndTime(form.date, form.startTime).toISOString() : null,
      endAt: form.endTime ? combineDateAndTime(form.date, form.endTime).toISOString() : null,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add New Task'}
      footer={
        <Button type="submit" form="task-form" fullWidth loading={submitting}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      }
    >
      <form id="task-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Task title" htmlFor="task-title" error={errors.title}>
          <Input
            id="task-title"
            value={form.title}
            onChange={update('title')}
            placeholder="What needs doing?"
            error={errors.title}
            maxLength={200}
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted">Set Time</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              aria-label="Start time"
              type="time"
              icon={Clock}
              value={form.startTime}
              onChange={update('startTime')}
              placeholder="Start"
            />
            <Input
              aria-label="End time"
              type="time"
              icon={Clock}
              value={form.endTime}
              onChange={update('endTime')}
              error={errors.endAt}
              placeholder="Ends"
            />
          </div>
          {errors.endAt ? <p className="text-xs text-danger">{errors.endAt}</p> : null}
        </div>

        <Field label="Set Date" htmlFor="task-date" error={errors.dueAt}>
          <Input
            id="task-date"
            type="date"
            trailing={<CalendarDays className="size-4 shrink-0 text-muted" />}
            value={form.date}
            onChange={update('date')}
            error={errors.dueAt}
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted">Priority</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.priority === value}
                onClick={() => setForm((current) => ({ ...current, priority: value }))}
                className={`h-11 rounded-control border text-sm font-medium capitalize transition-colors ${
                  form.priority === value
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-muted hover:border-primary/40'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <Field label="Description" htmlFor="task-description" error={errors.description}>
          <Textarea
            id="task-description"
            value={form.description}
            onChange={update('description')}
            placeholder="Add Description"
            maxLength={2000}
          />
        </Field>
      </form>
    </Modal>
  );
};
