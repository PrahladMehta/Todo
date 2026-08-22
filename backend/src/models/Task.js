import mongoose from 'mongoose';

export const TASK_STATUSES = ['in_progress', 'completed'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    dueAt: { type: Date, required: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    status: { type: String, enum: TASK_STATUSES, default: 'in_progress' },
    completedAt: { type: Date, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

taskSchema.index({ owner: 1, isDeleted: 1, dueAt: 1 });
taskSchema.index({ owner: 1, status: 1, isDeleted: 1 });

const syncCompletion = (target) => {
  if (target.status === 'completed' && !target.completedAt) {
    target.completedAt = new Date();
  }
  if (target.status === 'in_progress') {
    target.completedAt = null;
  }
};

taskSchema.pre('save', function preSave(next) {
  if (this.isModified('status')) syncCompletion(this);
  next();
});

export const Task = mongoose.model('Task', taskSchema);
