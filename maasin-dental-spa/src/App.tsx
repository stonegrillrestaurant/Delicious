import React, { useState } from 'react';
import { 
  UserRole, 
  Appointment, 
  ToothRecord, 
  TreatmentPlan, 
  DentalXRay, 
  ClinicalSOAPNote, 
  Prescription, 
  Invoice, 
  WaitlistEntry, 
  AuditLogEntry, 
  MedicalIntakeFormData 
} from './types/dental';
import { 
  DEMO_USERS, 
  CLINIC_LOCATIONS, 
  DENTISTS, 
  DENTAL_SERVICES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_WAITLIST, 
  createDefaultOdontogram, 
  INITIAL_TREATMENT_PLAN, 
  INITIAL_XRAYS, 
  INITIAL_SOAP_NOTES, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_INVOICES, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';

// Common Components
import { Navbar } from './components/common/Navbar';
import { RoleBanner } from './components/common/RoleBanner';
import { ClinicShowcaseBanner } from './components/common/ClinicShowcaseBanner';

// Patient Components
import { PatientBookingWizard } from './components/patient/PatientBookingWizard';
import { PatientPortal } from './components/patient/PatientPortal';
import { AiTriageModal } from './components/patient/AiTriageModal';
import { VoiceBookingModal } from './components/patient/VoiceBookingModal';
import { DigitalIntakeForm } from './components/patient/DigitalIntakeForm';
import { TelehealthRoom } from './components/patient/TelehealthRoom';

// Clinic Components
import { OdontogramChart } from './components/clinic/OdontogramChart';
import { TreatmentPlanBuilder } from './components/clinic/TreatmentPlanBuilder';
import { ClinicCalendar } from './components/clinic/ClinicCalendar';
import { WaitlistManager } from './components/clinic/WaitlistManager';
import { ClinicalNotesEditor } from './components/clinic/ClinicalNotesEditor';
import { XRayViewer } from './components/clinic/XRayViewer';
import { InsuranceEligibilityModal } from './components/clinic/InsuranceEligibilityModal';
import { RecallAndNoShowDashboard } from './components/clinic/RecallAndNoShowDashboard';

// Admin Components
import { PracticeAnalytics } from './components/admin/PracticeAnalytics';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { SuperAdminConsole } from './components/admin/SuperAdminConsole';

// Docs Component
import { SystemDocsModal } from './components/docs/SystemDocsModal';

import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  HeartPulse,
  Activity
} from 'lucide-react';

export default function App() {
  // Active User / Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [activeView, setActiveView] = useState<string>('portal');

  // Core Data Collections
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [teeth, setTeeth] = useState<ToothRecord[]>(createDefaultOdontogram());
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>(INITIAL_TREATMENT_PLAN);
  const [xrays, setXrays] = useState<DentalXRay[]>(INITIAL_XRAYS);
  const [soapNotes, setSoapNotes] = useState<ClinicalSOAPNote[]>(INITIAL_SOAP_NOTES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [intakeData, setIntakeData] = useState<MedicalIntakeFormData | null>(null);

  // Modal States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isVoiceBookingOpen, setIsVoiceBookingOpen] = useState(false);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Temporary selection passed to booking wizard
  const [presetServiceId, setPresetServiceId] = useState<string | undefined>(undefined);

  // Active user object based on role
  const currentUser = DEMO_USERS[currentRole] || DEMO_USERS.patient;

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'patient') {
      setActiveView('portal');
    } else if (newRole === 'dentist') {
      setActiveView('odontogram');
    } else if (newRole === 'receptionist') {
      setActiveView('calendar');
    } else if (newRole === 'admin') {
      setActiveView('analytics');
    } else if (newRole === 'superadmin') {
      setActiveView('superadmin');
    }

    // Append HIPAA Audit Log entry for role session switch
    logAuditAction('SWITCHED_ROLE_VIEW', `Active persona set to ${newRole}`);
  };

  const logAuditAction = (action: string, resource: string, patientName?: string) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName: currentUser.name,
      actorRole: currentRole,
      action,
      resource,
      patientName,
      ipAddress: '192.168.1.104',
      hipaaComplianceVerified: true,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Appointment Actions
  const handleBookingComplete = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    logAuditAction('CREATED_CHAIR_APPOINTMENT', `${newApt.serviceName} at ${newApt.locationName}`, newApt.patientName);
  };

  const handleUpdateAppointmentStatus = (aptId: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a))
    );
    const targetApt = appointments.find((a) => a.id === aptId);
    logAuditAction('UPDATED_APPOINTMENT_STATUS', `Status changed to ${newStatus}`, targetApt?.patientName);
  };

  const handleRescheduleAppointment = (aptId: string, newTime: string, newChair: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, time: newTime, operatoryChair: newChair } : a))
    );
    const targetApt = appointments.find((a) => a.id === aptId);
    logAuditAction('RESCHEDULED_CHAIR_TIME', `Moved to ${newTime} (${newChair})`, targetApt?.patientName);
  };

  // Odontogram Actions
  const handleUpdateTooth = (updatedTooth: ToothRecord) => {
    setTeeth((prev) =>
      prev.map((t) => (t.toothNumber === updatedTooth.toothNumber ? updatedTooth : t))
    );
    logAuditAction(
      'UPDATED_ODONTOGRAM_CHART',
      `Tooth #${updatedTooth.toothNumber} marked ${updatedTooth.generalCondition}`,
      'Emma Watson'
    );
  };

  const handleAddTreatmentItem = (
    toothNumber: number,
    description: string,
    cdtCode: string,
    fee: number
  ) => {
    const newItem = {
      id: `tx_${Date.now()}`,
      toothNumber,
      cdtCode,
      description,
      phase: 2 as const,
      fee,
      insuranceEstimatedCoverage: Math.round(fee * 0.75),
      patientEstimatedCost: Math.round(fee * 0.25),
      status: 'planned' as const,
      priority: 'recommended' as const,
    };

    const updatedItems = [...treatmentPlan.items, newItem];
    const totalFee = updatedItems.reduce((acc, i) => acc + i.fee, 0);
    const insTotal = updatedItems.reduce((acc, i) => acc + i.insuranceEstimatedCoverage, 0);

    setTreatmentPlan({
      ...treatmentPlan,
      items: updatedItems,
      totalFee,
      insuranceEstimatedTotal: insTotal,
      patientEstimatedTotal: totalFee - insTotal,
    });

    logAuditAction('ADDED_TREATMENT_ITEM', `${description} (${cdtCode}) for Tooth #${toothNumber}`, 'Emma Watson');
  };

  // Waitlist Auto-fill
  const handleFillWaitlistSlot = (entry: WaitlistEntry) => {
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: `pat_${Date.now()}`,
      patientName: entry.patientName,
      patientPhone: entry.patientPhone,
      patientEmail: `${entry.patientName.toLowerCase().replace(' ', '.')}@example.com`,
      dentistId: entry.dentistPreferredId || 'dent_1',
      dentistName: entry.dentistPreferredName || 'Dr. Alfred G. Roa III, DMD',
      serviceId: 'serv_emergency',
      serviceName: entry.serviceName,
      serviceCode: 'D0140',
      locationId: 'loc_maasin_main',
      locationName: 'Maasin Dental Spa (Main Clinic)',
      operatoryChair: 'Spa Operatory 1 (Blue Suite)',
      date: '2026-10-08',
      time: '13:00',
      durationMinutes: 45,
      status: 'confirmed',
      type: 'in_person',
      totalCost: 1200,
      insuranceStatus: 'verified',
      noShowRiskScore: 'low',
      notes: `Auto-filled from standby waitlist. ${entry.notes}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setAppointments((prev) => [newApt, ...prev]);
    setWaitlist((prev) => prev.filter((w) => w.id !== entry.id));
    logAuditAction('AUTO_FILLED_CANCELLATION_SLOT', `Promoted standby patient ${entry.patientName} to chair slot`);
  };

  // Invoicing & Payment
  const handlePayInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'paid' } : i))
    );
    const inv = invoices.find((i) => i.id === invoiceId);
    logAuditAction('COLLECTED_PATIENT_PAYMENT', `Settled ${inv?.invoiceNumber} (₱${inv?.patientPortion?.toLocaleString()}) via Contactless Payment`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleRoleChange}
        onOpenTriage={() => setIsTriageOpen(true)}
        onOpenVoiceBooking={() => setIsVoiceBookingOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenInsuranceModal={() => setIsInsuranceModalOpen(true)}
      />

      {/* Role Navigation Banner */}
      <RoleBanner
        currentRole={currentRole}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenTriage={() => setIsTriageOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Real Clinic Showcase & Contact Header */}
        <ClinicShowcaseBanner
          onBookClick={() => setIsBookingOpen(true)}
          onTriageClick={() => setIsTriageOpen(true)}
        />

        {/* Render View based on activeView */}
        {activeView === 'portal' && (
          <PatientPortal
            appointments={appointments.filter((a) => a.patientName === 'Emma Watson')}
            treatmentPlan={treatmentPlan}
            xrays={xrays}
            invoices={invoices}
            prescriptions={prescriptions}
            intakeData={intakeData}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenTelehealth={() => setIsTelehealthOpen(true)}
            onOpenIntake={() => setIsIntakeOpen(true)}
            onPayInvoice={handlePayInvoice}
          />
        )}

        {activeView === 'odontogram' && (
          <div className="space-y-6">
            <OdontogramChart
              teeth={teeth}
              onUpdateTooth={handleUpdateTooth}
              onAddTreatmentItem={handleAddTreatmentItem}
            />
          </div>
        )}

        {activeView === 'treatment_plan' && (
          <div className="space-y-6">
            <TreatmentPlanBuilder
              plan={treatmentPlan}
              onUpdatePlan={(updated) => {
                setTreatmentPlan(updated);
                logAuditAction('UPDATED_TREATMENT_PLAN', `Total plan adjusted to ₱${updated.totalFee.toLocaleString()}`);
              }}
            />
          </div>
        )}

        {activeView === 'soap_notes' && (
          <div className="space-y-6">
            <ClinicalNotesEditor
              notes={soapNotes}
              prescriptions={prescriptions}
              onAddNote={(newNote) => {
                setSoapNotes((prev) => [newNote, ...prev]);
                logAuditAction('CREATED_SOAP_CLINICAL_NOTE', 'SOAP Note signed with PRC dental key', 'Emma Watson');
              }}
              onAddPrescription={(newRx) => {
                setPrescriptions((prev) => [newRx, ...prev]);
                logAuditAction('DISPATCHED_E_PRESCRIPTION', `${newRx.medication} ${newRx.dosage} sent to Mercury Drug / Rose Pharmacy`, 'Emma Watson');
              }}
            />
          </div>
        )}

        {activeView === 'xrays' && (
          <div className="space-y-6">
            <XRayViewer xrays={xrays} />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="space-y-6">
            <ClinicCalendar
              appointments={appointments}
              dentists={DENTISTS}
              locations={CLINIC_LOCATIONS}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onReschedule={handleRescheduleAppointment}
              onNewAppointmentClick={() => setIsBookingOpen(true)}
            />
          </div>
        )}

        {activeView === 'waitlist' && (
          <div className="space-y-6">
            <WaitlistManager
              waitlist={waitlist}
              onFillSlot={handleFillWaitlistSlot}
              onRemoveEntry={(id) => setWaitlist((prev) => prev.filter((w) => w.id !== id))}
              onAddEntry={(entry) => setWaitlist((prev) => [entry, ...prev])}
            />
          </div>
        )}

        {activeView === 'recall' && (
          <div className="space-y-6">
            <RecallAndNoShowDashboard appointments={appointments} />
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <PracticeAnalytics locations={CLINIC_LOCATIONS} />
          </div>
        )}

        {activeView === 'audit_logs' && (
          <div className="space-y-6">
            <AuditLogViewer logs={auditLogs} />
          </div>
        )}

        {activeView === 'superadmin' && (
          <div className="space-y-6">
            <SuperAdminConsole />
          </div>
        )}
      </main>

      {/* Floating Action Badge for Booking & Triage */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsTriageOpen(true)}
          className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI Triage</span>
        </button>
        <button
          onClick={() => setIsBookingOpen(true)}
          className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Calendar className="w-4 h-4 text-teal-400" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* MODALS */}

      {/* 1. Patient Booking Wizard Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-150 my-6">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 p-2"
            >
              ✕
            </button>
            <PatientBookingWizard
              services={DENTAL_SERVICES}
              dentists={DENTISTS}
              locations={CLINIC_LOCATIONS}
              initialSelectedServiceId={presetServiceId}
              onBookingComplete={(newApt) => {
                handleBookingComplete(newApt);
              }}
              onOpenIntakeForm={() => {
                setIsBookingOpen(false);
                setIsIntakeOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. AI Triage Symptom Modal */}
      <AiTriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onSelectBooking={(serviceName) => {
          const matched = DENTAL_SERVICES.find((s) => s.name.includes(serviceName) || serviceName.includes(s.name));
          if (matched) setPresetServiceId(matched.id);
          setIsTriageOpen(false);
          setIsBookingOpen(true);
        }}
      />

      {/* 3. Voice Booking Modal */}
      <VoiceBookingModal
        isOpen={isVoiceBookingOpen}
        onClose={() => setIsVoiceBookingOpen(false)}
        onApplyBookingIntent={(intent) => {
          if (intent.serviceKeywords) {
            const matched = DENTAL_SERVICES.find((s) =>
              s.name.toLowerCase().includes(intent.serviceKeywords!.toLowerCase())
            );
            if (matched) setPresetServiceId(matched.id);
          }
          setIsVoiceBookingOpen(false);
          setIsBookingOpen(true);
        }}
      />

      {/* 4. Digital Intake Form Modal */}
      <DigitalIntakeForm
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSaveIntake={(data) => {
          setIntakeData(data);
          logAuditAction('SUBMITTED_DIGITAL_INTAKE', 'E-signed medical questionnaire', data.fullName);
        }}
      />

      {/* 5. Telehealth Video Room Modal */}
      <TelehealthRoom
        isOpen={isTelehealthOpen}
        onClose={() => setIsTelehealthOpen(false)}
        doctorName="Dr. Alfred G. Roa III, DMD"
        patientName="Emma Watson"
      />

      {/* 6. Insurance 270 Verification Modal */}
      <InsuranceEligibilityModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        patientName="Emma Watson"
      />

      {/* 7. System Docs & Architecture Artifacts Modal */}
      <SystemDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900">Maasin Dental Spa</span>
            <span>·</span>
            <span>Dr. Alfred G. Roa III, DMD</span>
            <span>·</span>
            <span className="text-slate-600">Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte</span>
            <span>·</span>
            <a href="tel:0535708220" className="font-mono font-bold text-teal-800 hover:text-teal-900">
              Tel: 053 570 -8220
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-teal-600 underline">
              Architecture &amp; PRD Docs
            </button>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Licensed Dental Practice
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
