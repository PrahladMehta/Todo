import mongoose from 'mongoose';
import { ROLES } from '../config/permissions.js';

const providerSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['google'], required: true },
    providerId: { type: String, required: true },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    providers: { type: [providerSchema], default: [], select: false },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.providers;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ 'providers.provider': 1, 'providers.providerId': 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.virtual('hasPassword').get(function hasPassword() {
  return Boolean(this.passwordHash);
});

export const User = mongoose.model('User', userSchema);
