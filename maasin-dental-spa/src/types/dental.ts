export type UserRole = 'patient' | 'dentist' | 'receptionist' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  clinicId?: string;
}

export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  chairsCount: number;
  operatingHours: string;
}

export interface Dentist {
  id: string;
  name: string;
  title: string;
  specialty: 'General Dentistry' | 'Endodontics' | 'Periodontics' | 'Orthodontics' | 'Oral Surgery' | 'Pediatric Dentistry';
  bio: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  locationIds: string[];
  chairAssignment: string;
}

export interface DentalService {
  id: string;
  code: string; // CDT code, e.g. D0120
  name: string;
  category: 'Preventive' | 'Restorative' | 'Endodontics' | 'Periodontics' | 'Cosmetic' | 'Emergency' | 'Surgical';
  durationMinutes: number;
  standardFee: number;
  insuranceCoveredPercent: number;
  description: string;
  popular?: boolean;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked_in' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  dentistId: string;
  dentistName: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  locationId: string;
  locationName: string;
  operatoryChair: string; // e.g. "Chair 1 - Operatory North"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  type: 'in_person' | 'telehealth';
  totalCost: number;
  insuranceStatus: 'verified' | 'pending' | 'self_pay';
  noShowRiskScore: 'low' | 'medium' | 'high';
  noShowRiskFactor?: string;
  notes?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone: string;
  serviceName: string;
  dentistPreferredId?: string;
  dentistPreferredName?: string;
  urgency: 'high' | 'medium' | 'routine';
  preferredDays: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'any';
  notes: string;
  addedAt: string;
}

// Tooth numbering 1-32 (Adult Universal Numbering)
export type ToothSurface = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

export type ToothCondition = 
  | 'healthy'
  | 'caries' // Cavity
  | 'composite_filling'
  | 'amalgam_filling'
  | 'crown_porcelain'
  | 'crown_gold'
  | 'root_canal'
  | 'implant'
  | 'extracted' // missing
  | 'veneer'
  | 'fractured';

export interface ToothSurfaceState {
  occlusal: ToothCondition;
  mesial: ToothCondition;
  distal: ToothCondition;
  buccal: ToothCondition;
  lingual: ToothCondition;
}

export interface ToothRecord {
  toothNumber: number; // 1 to 32
  name: string;
  generalCondition: ToothCondition;
  surfaces: ToothSurfaceState;
  periodontalPocketDepths: [number, number, number, number, number, number]; // 6-point probing depths in mm
  bleedingOnProbing: boolean;
  notes?: string;
  existingRestoration?: string;
  plannedTreatment?: string;
}

export interface TreatmentPlanItem {
  id: string;
  toothNumber?: number;
  surface?: string;
  cdtCode: string;
  description: string;
  phase: 1 | 2 | 3; // Phase 1: Urgent/Pain, Phase 2: Restorative, Phase 3: Cosmetic/Maintenance
  fee: number;
  insuranceEstimatedCoverage: number;
  patientEstimatedCost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'declined';
  priority: 'urgent' | 'recommended' | 'optional';
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  totalFee: number;
  insuranceEstimatedTotal: number;
  patientEstimatedTotal: number;
  items: TreatmentPlanItem[];
  aiPlainEnglishExplanation?: string;
}

export interface DentalXRay {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'Bitewing' | 'Periapical' | 'Panoramic' | 'CBCT 3D';
  teethCovered: string;
  imageUrl: string;
  findings: string[];
  radiologistNotes: string;
}

export interface ClinicalSOAPNote {
  id: string;
  patientId: string;
  dentistId: string;
  dentistName: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
  prescribedBy: string;
  date: string;
  pharmacyStatus: 'sent' | 'dispensed' | 'pending';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: {
    description: string;
    code: string;
    amount: number;
  }[];
  totalAmount: number;
  insurancePortion: number;
  patientPortion: number;
  status: 'paid' | 'pending' | 'overdue';
  installmentPlan?: {
    months: number;
    monthlyAmount: number;
    paidMonths: number;
  };
}

export interface MedicalIntakeFormData {
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hasHeartDisease: boolean;
  hasDiabetes: boolean;
  hasHighBloodPressure: boolean;
  hasBleedingDisorders: boolean;
  isPregnant: boolean;
  allergies: string[];
  currentMedications: string;
  dentalAnxietyLevel: 'none' | 'mild' | 'moderate' | 'severe';
  chiefComplaint: string;
  lastDentalVisit: string;
  consentAgreed: boolean;
  signatureDataUrl?: string;
  signedDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  patientName?: string;
  ipAddress: string;
  hipaaComplianceVerified: boolean;
}

export interface AiTriageResult {
  urgencyLevel: 'Emergency' | 'Urgent' | 'Routine' | 'Non-Urgent';
  urgencyScore: number; // 1-100
  clinicalSummary: string;
  possibleConditions: string[];
  suggestedCdtCode: string;
  suggestedServiceName: string;
  recommendedSpecialist: string;
  homeCareAdvice: string[];
  warningFlags: string[];
}
