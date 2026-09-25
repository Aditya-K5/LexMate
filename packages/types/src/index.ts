// ==========================================
// LexMate Core Domain Types
// ==========================================

export type UserRole = 'ADMIN' | 'LAWYER' | 'ASSOCIATE' | 'STAFF';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CaseStatus = 'ACTIVE' | 'PENDING' | 'DISPOSED' | 'APPEALED' | 'ARCHIVED';

export interface Case {
  id: string;
  organizationId: string;
  clientId: string;
  caseNumber: string;
  caseType: string;
  court: string;
  judge?: string;
  status: CaseStatus;
  title: string;
  summary?: string;
  nextHearingDate?: Date;
  assignedLawyerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HearingStatus = 'SCHEDULED' | 'ADJOURNED' | 'COMPLETED' | 'CANCELLED';

export interface Hearing {
  id: string;
  organizationId: string;
  caseId: string;
  title: string;
  court: string;
  courtroom?: string;
  judge?: string;
  date: Date;
  status: HearingStatus;
  purpose?: string;
  outcome?: string;
  nextHearingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  companyName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  organizationId: string;
  caseId?: string;
  clientId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  category?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  organizationId: string;
  caseId?: string;
  assignedToId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'REFUNDED';

export interface Payment {
  id: string;
  organizationId: string;
  clientId: string;
  caseId?: string;
  amount: number;
  paidAmount: number;
  currency: string;
  status: PaymentStatus;
  dueDate?: Date;
  paidAt?: Date;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  organizationId: string;
  caseId: string;
  title: string;
  description?: string;
  date: Date;
  type: 'HEARING' | 'FILING' | 'ORDER' | 'MEETING' | 'NOTE';
  createdAt: Date;
}
