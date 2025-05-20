// types/index.ts

// Types for field definitions
export type FieldType = 'text' | 'email' | 'tel' | 'photo' | 'number';
export type FieldCategory = 'basic' | 'advanced' | 'custom';

export interface VisitorField {
  id: number;
  name: string;
  label: string;
  required: boolean;
  visible: boolean;
  premium?: boolean;
  type: FieldType;
  custom?: boolean;
  category: FieldCategory;
  options?: Array<{ label: string; value: string }>; // For select fields
}

// Admission Modes - Mutually exclusive
export type AdmissionMode = 
  | { 
      type: 'auto_admit';
      settings?: {
        notifyOnAdmit?: boolean;  // Optional notification settings
      };
    }
  | { 
      type: 'manual_approval';
      settings?: {
        approvalRoles?: string[];  // Roles that can approve
        notifyApprovers?: boolean; // Whether to notify approvers
      };
    };

// Premise Configuration
export interface PremiseConfig {
  id: string;
  name: string;
  visitorFields: VisitorField[];
  admission: AdmissionMode;
  createdAt: string;
  updatedAt: string;
  // Future features
  // useAICounter?: boolean;
  // timezone?: string;
}

// Visitor Entry Status
export type VisitorStatus = 
  | 'pending_approval'  // Waiting for manual approval
  | 'approved'          // Approved but not checked in
  | 'checked_in'        // Currently on premises
  | 'checked_out'       // Visit completed
  | 'rejected';         // Visit was rejected

// Visitor Entry
export interface VisitorEntry {
  id: string;
  premiseId: string;
  status: VisitorStatus;
  
  // Visitor Information
  fields: Record<string, any>;
  
  // Timing
  checkIn?: string;     // When they actually checked in
  checkOut?: string;    // When they checked out
  expectedCheckIn?: string; // For pre-approved visits
  expectedCheckOut?: string;
  
  // Entry Method
  entryMethod: 'qr_code' | 'manual_entry';
  qrCodeId?: string;    // If entered via QR code
  
  // Approval
  approvedBy?: string;  // User ID who approved
  approvedAt?: string;
  rejectedReason?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };
}

// QR Code Management
export interface QRCode {
  id: string;
  premiseId: string;
  code: string;
  name?: string;
  isActive: boolean;
  expiresAt?: string;
  maxUses?: number;
  useCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Form Handling
export interface FormField extends Omit<VisitorField, 'id' | 'category'> {
  value: any;
  error?: string;
}

export interface FormState {
  [key: string]: FormField;
}

// Default Visitor Fields
export const defaultVisitorFields: VisitorField[] = [
  // Basic Fields
  { 
    id: 1, 
    name: "name", 
    label: "Full Name", 
    required: true, 
    visible: true, 
    premium: false, 
    type: "text", 
    category: "basic" 
  },
  { 
    id: 2, 
    name: "idnumber", 
    label: "ID Number", 
    required: true, 
    visible: true, 
    premium: false, 
    type: "text", 
    category: "basic" 
  },
  { 
    id: 3, 
    name: "phone", 
    label: "Phone Number", 
    required: true, 
    visible: true, 
    premium: false, 
    type: "tel", 
    category: "basic" 
  },
  { 
    id: 4, 
    name: "email", 
    label: "Email Address", 
    required: false, 
    visible: true, 
    premium: false, 
    type: "email", 
    category: "basic" 
  },
  
  // Advanced Fields
  { 
    id: 5, 
    name: "idphoto", 
    label: "ID Photo", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "photo", 
    category: "advanced" 
  },
  { 
    id: 6, 
    name: "facephoto", 
    label: "Face Photo", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "photo", 
    category: "advanced" 
  },
  { 
    id: 7, 
    name: "purpose", 
    label: "Purpose of Visit", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "text", 
    category: "advanced" 
  },
  { 
    id: 8, 
    name: "department", 
    label: "Department", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "text", 
    category: "advanced" 
  },
  { 
    id: 9, 
    name: "whoVisited", 
    label: "Who is being visited", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "text", 
    category: "advanced" 
  },
  { 
    id: 10, 
    name: "vehicleRegistration", 
    label: "Vehicle Registration", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "text", 
    category: "advanced" 
  },
  { 
    id: 11, 
    name: "groupsize", 
    label: "Number in Group", 
    required: false, 
    visible: false, 
    premium: true, 
    type: "number", 
    category: "advanced" 
  }
];

// Helper Types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Type Guards
export function isAutoAdmit(mode: AdmissionMode): mode is { type: 'auto_admit'; settings?: any } {
  return mode.type === 'auto_admit';
}

export function isManualApproval(mode: AdmissionMode): mode is { type: 'manual_approval'; settings?: any } {
  return mode.type === 'manual_approval';
}

// Default Premise Config
export const defaultPremiseConfig: Omit<PremiseConfig, 'id' | 'name'> = {
  visitorFields: defaultVisitorFields,
  admission: { type: 'manual_approval' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};