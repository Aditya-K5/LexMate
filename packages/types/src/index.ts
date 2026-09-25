// ==========================================
// LexMate Core Domain Types
// ==========================================

export type UserRole = 'ADMIN' | 'LAWYER' | 'ASSOCIATE' | 'STAFF';

export enum Permission {
  // Organization
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',

  // Users
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Cases
  CASE_CREATE = 'case:create',
  CASE_READ = 'case:read',
  CASE_UPDATE = 'case:update',
  CASE_DELETE = 'case:delete',

  // Clients
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',

  // Hearings
  HEARING_CREATE = 'hearing:create',
  HEARING_READ = 'hearing:read',
  HEARING_UPDATE = 'hearing:update',
  HEARING_DELETE = 'hearing:delete',

  // Documents
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_DELETE = 'document:delete',

  // Tasks
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',

  // Payments
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ = 'payment:read',
  PAYMENT_UPDATE = 'payment:update',

  // Audit
  AUDIT_READ = 'audit:read',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(Permission),
  LAWYER: [
    Permission.ORG_READ,
    Permission.USER_READ,
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.HEARING_CREATE,
    Permission.HEARING_READ,
    Permission.HEARING_UPDATE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_READ,
  ],
  ASSOCIATE: [
    Permission.ORG_READ,
    Permission.USER_READ,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.CLIENT_READ,
    Permission.HEARING_READ,
    Permission.HEARING_UPDATE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
  ],
  STAFF: [
    Permission.ORG_READ,
    Permission.CASE_READ,
    Permission.CLIENT_READ,
    Permission.HEARING_READ,
    Permission.TASK_READ,
    Permission.DOCUMENT_READ,
  ],
};

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  organizationId: string;
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
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

// ==========================================
// Authentication Types
// ==========================================

export type SafeUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface AuthResponse {
  user: SafeUser;
  organization: Organization;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
  role?: UserRole;
  phone?: string;
}
