import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'LAWYER', 'ASSOCIATE', 'STAFF']);

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: UserRoleSchema,
  phone: z.string().optional(),
});

export const CaseStatusSchema = z.enum(['ACTIVE', 'PENDING', 'DISPOSED', 'APPEALED', 'ARCHIVED']);

export const CreateCaseSchema = z.object({
  clientId: z.string().uuid(),
  caseNumber: z.string().min(1, 'Case number is required'),
  caseType: z.string().min(1, 'Case type is required'),
  court: z.string().min(1, 'Court is required'),
  judge: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().optional(),
  nextHearingDate: z.coerce.date().optional(),
  assignedLawyerId: z.string().uuid().optional(),
});

export const HearingStatusSchema = z.enum(['SCHEDULED', 'ADJOURNED', 'COMPLETED', 'CANCELLED']);

export const CreateHearingSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(1, 'Hearing title is required'),
  court: z.string().min(1, 'Court is required'),
  courtroom: z.string().optional(),
  judge: z.string().optional(),
  date: z.coerce.date(),
  purpose: z.string().optional(),
});

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone number is required'),
  address: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const TaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const CreateTaskSchema = z.object({
  caseId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  priority: TaskPrioritySchema.default('MEDIUM'),
});
