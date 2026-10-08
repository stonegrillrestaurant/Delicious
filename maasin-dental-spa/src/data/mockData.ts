import {
  ClinicLocation,
  Dentist,
  DentalService,
  Appointment,
  WaitlistEntry,
  ToothRecord,
  TreatmentPlan,
  DentalXRay,
  ClinicalSOAPNote,
  Prescription,
  Invoice,
  AuditLogEntry,
  User,
} from '../types/dental';

export const CLINIC_PHOTOS = {
  doctorOperatory: '/3d45e9e3-1f2f-4230-ad78-3f9ae8154d49.jpg',
  operatoryChair: '/0e4e932e-9784-41f5-bf35-01b2a8aae666.jpg',
  lobbyWallLogo: '/e564f908-5cb8-4a44-b7fe-2d12528b5401.jpg',
  receptionDesk: '/6f9ed503-6c98-424c-a164-4083b9f8fe98.jpg',
};

export const DEMO_USERS: Record<string, User> = {
  patient: {
    id: 'user_pat_101',
    name: 'Emma Watson',
    email: 'emma.watson@example.com',
    role: 'patient',
    phone: '0917 555 0182',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    clinicId: 'clinic_maasin',
  },
  dentist: {
    id: 'user_doc_201',
    name: 'Dr. Alfred G. Roa III, DMD',
    email: 'dr.alfred.roa@maasindentalspa.ph',
    role: 'dentist',
    phone: '053 570 -8220',
    avatar: CLINIC_PHOTOS.doctorOperatory,
    clinicId: 'clinic_maasin',
  },
  receptionist: {
    id: 'user_rec_301',
    name: 'Maria Santos (Front Desk)',
    email: 'reception@maasindentalspa.ph',
    role: 'receptionist',
    phone: '053 570 -8220',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    clinicId: 'clinic_maasin',
  },
  admin: {
    id: 'user_adm_401',
    name: 'Dr. Alfred G. Roa III (Clinic Director)',
    email: 'director@maasindentalspa.ph',
    role: 'admin',
    phone: '053 570 -8220',
    avatar: CLINIC_PHOTOS.doctorOperatory,
    clinicId: 'clinic_maasin',
  },
  superadmin: {
    id: 'user_sup_501',
    name: 'DentaFlow Network Admin',
    email: 'admin@dentaflow-network.io',
    role: 'superadmin',
    phone: '+63 2 8555 0199',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
};

export const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    id: 'loc_maasin_main',
    name: 'Maasin Dental Spa (Main Clinic)',
    address: 'Ruperto K. Kangleon St',
    city: 'Maasin',
    state: 'Southern Leyte',
    zip: '6600',
    phone: '053 570 -8220',
    chairsCount: 3,
    operatingHours: 'Mon - Sat: 8:30 AM - 5:30 PM | Sun: By Appointment',
  },
];

export const DENTISTS: Dentist[] = [
  {
    id: 'dent_1',
    name: 'Dr. Alfred G. Roa III, DMD',
    title: 'Principal Dentist & Smile Aesthetics Specialist',
    specialty: 'General Dentistry',
    bio: 'Lead clinician at Maasin Dental Spa on Ruperto K. Kangleon St. Dedicated to high-precision restorative dentistry, cosmetic smile transformations, endodontics, and gentle dental spa care in Southern Leyte.',
    avatar: CLINIC_PHOTOS.doctorOperatory,
    rating: 4.98,
    reviewsCount: 420,
    locationIds: ['loc_maasin_main'],
    chairAssignment: 'Spa Operatory 1 (Blue Suite)',
  },
  {
    id: 'dent_2',
    name: 'Dr. Kristina Tan, DMD',
    title: 'Associate Dental Surgeon & Orthodontics',
    specialty: 'Orthodontics',
    bio: 'Specialist in preventative oral health, pediatric comfort care, and fixed appliance orthodontic alignment.',
    avatar: 'https://images.unsplash.com/photo-1594824813576-905164287860?auto=format&fit=crop&w=300&h=300&q=80',
    rating: 4.91,
    reviewsCount: 165,
    locationIds: ['loc_maasin_main'],
    chairAssignment: 'Spa Operatory 2 (Aesthetic Bay)',
  },
];

export const DENTAL_SERVICES: DentalService[] = [
  {
    id: 'serv_clean_exam',
    code: 'D0120/D1110',
    name: 'Comprehensive Oral Exam & Ultrasonic Dental Spa Cleaning',
    category: 'Preventive',
    durationMinutes: 45,
    standardFee: 1500, // PHP 1,500
    insuranceCoveredPercent: 100,
    description: 'Complete intraoral charting, oral cancer check, ultrasonic scaling with gentle water lavage, tooth polish, and fluoride enamel treatment.',
    popular: true,
  },
  {
    id: 'serv_emergency',
    code: 'D0140/D0220',
    name: 'Emergency Dental Pain Evaluation & Digital Radiograph',
    category: 'Emergency',
    durationMinutes: 30,
    standardFee: 1200, // PHP 1,200
    insuranceCoveredPercent: 80,
    description: 'Immediate diagnostic triage for acute toothaches, chipped teeth, trauma, or swelling by Dr. Alfred Roa III with periapical X-ray.',
    popular: true,
  },
  {
    id: 'serv_filling',
    code: 'D2392',
    name: 'Light-Cure Aesthetic Composite Restoration (Tooth-Colored)',
    category: 'Restorative',
    durationMinutes: 45,
    standardFee: 1800, // PHP 1,800
    insuranceCoveredPercent: 80,
    description: 'High-strength nano-hybrid composite resin filling matching natural enamel shade, light-cured with surgical precision.',
    popular: true,
  },
  {
    id: 'serv_crown',
    code: 'D2740',
    name: 'Precision Porcelain / Zirconia Ceramic Crown',
    category: 'Restorative',
    durationMinutes: 60,
    standardFee: 14000, // PHP 14,000
    insuranceCoveredPercent: 50,
    description: 'Custom bioceramic crown restoration for fractured or weakened molars with digital shade-matching.',
    popular: true,
  },
  {
    id: 'serv_root_canal',
    code: 'D3330',
    name: 'Molar Endodontic Therapy (Root Canal Treatment)',
    category: 'Endodontics',
    durationMinutes: 75,
    standardFee: 12500, // PHP 12,500
    insuranceCoveredPercent: 70,
    description: 'Painless microscopic cleaning, shaping, and warm gutta-percha seal to relieve nerve pain and preserve your natural tooth.',
    popular: true,
  },
  {
    id: 'serv_whitening',
    code: 'D9972',
    name: 'In-Office Dental Spa Laser Teeth Whitening',
    category: 'Cosmetic',
    durationMinutes: 60,
    standardFee: 12000, // PHP 12,000
    insuranceCoveredPercent: 0,
    description: 'Instant 6-8 shade brightening in one relaxing visit with specialized enamel protection and gum barrier.',
    popular: true,
  },
  {
    id: 'serv_extraction',
    code: 'D7140',
    name: 'Gentle Painless Tooth Extraction (Simple / Surgical)',
    category: 'Surgical',
    durationMinutes: 45,
    standardFee: 2000, // PHP 2,000
    insuranceCoveredPercent: 80,
    description: 'Minimally invasive tooth removal with profound localized comfort anesthesia and post-op care pack.',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    patientPhone: '0917 555 0182',
    patientEmail: 'emma.watson@example.com',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    serviceId: 'serv_root_canal',
    serviceName: 'Molar Endodontic Therapy (Tooth #19)',
    serviceCode: 'D3330',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Spa Operatory 1 (Blue Suite)',
    date: '2026-10-08',
    time: '09:00',
    durationMinutes: 75,
    status: 'in_chair',
    type: 'in_person',
    totalCost: 12500,
    insuranceStatus: 'verified',
    noShowRiskScore: 'low',
    notes: 'Patient reported cold sensitivity and pain when biting. Tooth #19 symptomatic irreversible pulpitis.',
    createdAt: '2026-10-01',
  },
  {
    id: 'apt_2',
    patientId: 'pat_202',
    patientName: 'David Tan',
    patientPhone: '0918 555 4819',
    patientEmail: 'david.tan@southernleyte.ph',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    serviceId: 'serv_clean_exam',
    serviceName: 'Comprehensive Oral Exam & Ultrasonic Dental Spa Cleaning',
    serviceCode: 'D0120/D1110',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Spa Operatory 1 (Blue Suite)',
    date: '2026-10-08',
    time: '10:30',
    durationMinutes: 45,
    status: 'checked_in',
    type: 'in_person',
    totalCost: 1500,
    insuranceStatus: 'verified',
    noShowRiskScore: 'low',
    notes: 'Semi-annual oral prophylaxis. Patient in Maasin Dental Spa waiting lounge.',
    createdAt: '2026-09-28',
  },
  {
    id: 'apt_3',
    patientId: 'pat_303',
    patientName: 'Elena Ramos',
    patientPhone: '0920 555 7721',
    patientEmail: 'elena.ramos@maasin.gov.ph',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    serviceId: 'serv_crown',
    serviceName: 'Precision Porcelain Crown Prep (Tooth #30)',
    serviceCode: 'D2740',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Spa Operatory 1 (Blue Suite)',
    date: '2026-10-08',
    time: '11:45',
    durationMinutes: 60,
    status: 'confirmed',
    type: 'in_person',
    totalCost: 14000,
    insuranceStatus: 'verified',
    noShowRiskScore: 'low',
    notes: 'Tooth #30 disto-occlusal cusp fracture. Tooth is vital.',
    createdAt: '2026-10-04',
  },
  {
    id: 'apt_4',
    patientId: 'pat_404',
    patientName: 'Marcus Go',
    patientPhone: '0919 555 3211',
    patientEmail: 'marcus.go@leytebusiness.com',
    dentistId: 'dent_2',
    dentistName: 'Dr. Kristina Tan, DMD',
    serviceId: 'serv_filling',
    serviceName: 'Light-Cure Aesthetic Composite Restoration',
    serviceCode: 'D2392',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Spa Operatory 2 (Aesthetic Bay)',
    date: '2026-10-08',
    time: '14:00',
    durationMinutes: 45,
    status: 'confirmed',
    type: 'in_person',
    totalCost: 1800,
    insuranceStatus: 'verified',
    noShowRiskScore: 'low',
    notes: 'Class II restoration upper premolar #12.',
    createdAt: '2026-10-02',
  },
  {
    id: 'apt_5',
    patientId: 'pat_505',
    patientName: 'Chloe Mendoza',
    patientPhone: '0922 555 9082',
    patientEmail: 'chloe.mendoza@gmail.com',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    serviceId: 'serv_whitening',
    serviceName: 'In-Office Dental Spa Laser Teeth Whitening',
    serviceCode: 'D9972',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Spa Operatory 1 (Blue Suite)',
    date: '2026-10-08',
    time: '15:15',
    durationMinutes: 60,
    status: 'scheduled',
    type: 'in_person',
    totalCost: 12000,
    insuranceStatus: 'self_pay',
    noShowRiskScore: 'low',
    notes: 'Aesthetic smile glow package before anniversary.',
    createdAt: '2026-10-05',
  },
  {
    id: 'apt_6',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    patientPhone: '0917 555 0182',
    patientEmail: 'emma.watson@example.com',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    serviceId: 'serv_emergency',
    serviceName: 'Post-Op Follow-up & Seal Check (Telehealth Video)',
    serviceCode: 'D0140',
    locationId: 'loc_maasin_main',
    locationName: 'Maasin Dental Spa (Main Clinic)',
    operatoryChair: 'Virtual Consultation Room',
    date: '2026-10-12',
    time: '16:00',
    durationMinutes: 20,
    status: 'confirmed',
    type: 'telehealth',
    totalCost: 800,
    insuranceStatus: 'verified',
    noShowRiskScore: 'low',
    notes: 'Tele-dentistry check on symptom relief following endodontic treatment.',
    createdAt: '2026-10-08',
  },
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait_1',
    patientName: 'Arthur Veloso',
    patientPhone: '0917 555 6120',
    serviceName: 'Emergency Pain Evaluation',
    dentistPreferredId: 'dent_1',
    dentistPreferredName: 'Dr. Alfred G. Roa III, DMD',
    urgency: 'high',
    preferredDays: ['Monday', 'Thursday', 'Friday'],
    preferredTimeOfDay: 'morning',
    notes: 'Sharp edge on cracked upper incisor cutting lip. Lives 5 mins away on Kangleon St.',
    addedAt: '2026-10-07 16:30',
  },
  {
    id: 'wait_2',
    patientName: 'Serena Alvarez',
    patientPhone: '0918 555 8911',
    serviceName: 'Comprehensive Oral Exam & Cleaning',
    dentistPreferredId: 'dent_1',
    dentistPreferredName: 'Dr. Alfred G. Roa III, DMD',
    urgency: 'routine',
    preferredDays: ['Thursday', 'Friday', 'Saturday'],
    preferredTimeOfDay: 'afternoon',
    notes: 'Available for immediate walk-in if 2:00 PM chair slot opens up.',
    addedAt: '2026-10-08 07:15',
  },
  {
    id: 'wait_3',
    patientName: 'Julian Mercado',
    patientPhone: '0921 555 4309',
    serviceName: 'Crown Prep Appointment',
    dentistPreferredId: 'dent_1',
    dentistPreferredName: 'Dr. Alfred G. Roa III, DMD',
    urgency: 'medium',
    preferredDays: ['Wednesday', 'Thursday'],
    preferredTimeOfDay: 'morning',
    notes: 'Temporary crown loose, ready for prompt visit.',
    addedAt: '2026-10-07 19:40',
  },
];

export const createDefaultOdontogram = (): ToothRecord[] => {
  const toothNames: Record<number, string> = {
    1: 'Upper Right 3rd Molar (#1)',
    2: 'Upper Right 2nd Molar (#2)',
    3: 'Upper Right 1st Molar (#3)',
    4: 'Upper Right 2nd Premolar (#4)',
    5: 'Upper Right 1st Premolar (#5)',
    6: 'Upper Right Canine (#6)',
    7: 'Upper Right Lateral Incisor (#7)',
    8: 'Upper Right Central Incisor (#8)',
    9: 'Upper Left Central Incisor (#9)',
    10: 'Upper Left Lateral Incisor (#10)',
    11: 'Upper Left Canine (#11)',
    12: 'Upper Left 1st Premolar (#12)',
    13: 'Upper Left 2nd Premolar (#13)',
    14: 'Upper Left 1st Molar (#14)',
    15: 'Upper Left 2nd Molar (#15)',
    16: 'Upper Left 3rd Molar (#16)',
    17: 'Lower Left 3rd Molar (#17)',
    18: 'Lower Left 2nd Molar (#18)',
    19: 'Lower Left 1st Molar (#19)',
    20: 'Lower Left 2nd Premolar (#20)',
    21: 'Lower Left 1st Premolar (#21)',
    22: 'Lower Left Canine (#22)',
    23: 'Lower Left Lateral Incisor (#23)',
    24: 'Lower Left Central Incisor (#24)',
    25: 'Lower Right Central Incisor (#25)',
    26: 'Lower Right Lateral Incisor (#26)',
    27: 'Lower Right Canine (#27)',
    28: 'Lower Right 1st Premolar (#28)',
    29: 'Lower Right 2nd Premolar (#29)',
    30: 'Lower Right 1st Molar (#30)',
    31: 'Lower Right 2nd Molar (#31)',
    32: 'Lower Right 3rd Molar (#32)',
  };

  const records: ToothRecord[] = [];

  for (let i = 1; i <= 32; i++) {
    let condition = 'healthy' as any;
    let surfaces = {
      occlusal: 'healthy',
      mesial: 'healthy',
      distal: 'healthy',
      buccal: 'healthy',
      lingual: 'healthy',
    } as any;

    let pocketDepths: [number, number, number, number, number, number] = [2, 2, 2, 2, 2, 2];
    let bleeding = false;
    let notes = '';
    let existingRestoration = '';
    let plannedTreatment = '';

    if (i === 1 || i === 16 || i === 17 || i === 32) {
      condition = 'extracted';
      notes = 'Wisdom teeth extracted';
    } else if (i === 19) {
      condition = 'root_canal';
      surfaces.occlusal = 'caries';
      surfaces.distal = 'caries';
      pocketDepths = [4, 4, 5, 4, 3, 4];
      bleeding = true;
      notes = 'Deep caries extending into pulp chamber. Endo therapy scheduled by Dr. Alfred Roa III.';
      plannedTreatment = 'D3330 Molar Root Canal + Core Buildup + Zirconia Crown';
    } else if (i === 14) {
      condition = 'caries';
      surfaces.occlusal = 'caries';
      pocketDepths = [3, 2, 3, 2, 3, 2];
      notes = 'Class I occlusal caries detected on bite-wing x-ray.';
      plannedTreatment = 'D2391 Composite 1-surface restoration';
    } else if (i === 30) {
      condition = 'crown_porcelain';
      surfaces.occlusal = 'crown_porcelain';
      surfaces.buccal = 'crown_porcelain';
      surfaces.lingual = 'crown_porcelain';
      pocketDepths = [3, 3, 2, 2, 3, 2];
      existingRestoration = 'Porcelain fused to Zirconia Crown placed at Maasin Dental Spa';
    } else if (i === 3) {
      condition = 'composite_filling';
      surfaces.occlusal = 'composite_filling';
      surfaces.mesial = 'composite_filling';
      existingRestoration = 'MO light-cure composite in good margins';
    }

    records.push({
      toothNumber: i,
      name: toothNames[i] || `Tooth #${i}`,
      generalCondition: condition,
      surfaces,
      periodontalPocketDepths: pocketDepths,
      bleedingOnProbing: bleeding,
      notes,
      existingRestoration,
      plannedTreatment,
    });
  }

  return records;
};

export const INITIAL_TREATMENT_PLAN: TreatmentPlan = {
  id: 'tx_plan_emma_roa',
  patientId: 'user_pat_101',
  patientName: 'Emma Watson',
  createdAt: '2026-10-06',
  totalFee: 31000, // PHP 31,000
  insuranceEstimatedTotal: 22000,
  patientEstimatedTotal: 9000,
  aiPlainEnglishExplanation: 'At Maasin Dental Spa, Dr. Alfred G. Roa III, DMD designed your personalized dental plan into 3 gentle phases: First, we will relieve all nerve pressure in your lower left molar (#19) with comfortable root canal therapy. Next, we will repair the small cavity on your upper molar (#14) with a natural tooth-colored resin filling, and place a custom ceramic crown on tooth #19 so you can chew comfortably. Finally, we complete an ultrasonic dental spa polish to keep your gums healthy and fresh.',
  items: [
    {
      id: 'tx_item_1',
      toothNumber: 19,
      surface: 'MOD',
      cdtCode: 'D3330',
      description: 'Molar Endodontic Therapy (Lower Left #19)',
      phase: 1,
      fee: 12500,
      insuranceEstimatedCoverage: 9500,
      patientEstimatedCost: 3000,
      status: 'in_progress',
      priority: 'urgent',
    },
    {
      id: 'tx_item_2',
      toothNumber: 19,
      surface: 'Core',
      cdtCode: 'D2950',
      description: 'Core Buildup with Fiber Post reinforcement',
      phase: 2,
      fee: 2700,
      insuranceEstimatedCoverage: 2000,
      patientEstimatedCost: 700,
      status: 'planned',
      priority: 'recommended',
    },
    {
      id: 'tx_item_3',
      toothNumber: 19,
      surface: 'Full',
      cdtCode: 'D2740',
      description: 'Precision Porcelain / Zirconia Ceramic Crown',
      phase: 2,
      fee: 14000,
      insuranceEstimatedCoverage: 9000,
      patientEstimatedCost: 5000,
      status: 'planned',
      priority: 'recommended',
    },
    {
      id: 'tx_item_4',
      toothNumber: 14,
      surface: 'O',
      cdtCode: 'D2391',
      description: 'Aesthetic Composite Light-Cure Resin (1-Surface)',
      phase: 2,
      fee: 1800,
      insuranceEstimatedCoverage: 1500,
      patientEstimatedCost: 300,
      status: 'planned',
      priority: 'recommended',
    },
  ],
};

export const INITIAL_XRAYS: DentalXRay[] = [
  {
    id: 'xray_1',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    date: '2026-10-06',
    type: 'Periapical',
    teethCovered: 'Teeth #18, #19, #20 (Lower Left Mandible)',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    findings: [
      'Tooth #19 shows radiolucency in distal coronal pulp chamber indicating deep caries.',
      'Slight widening of apical periodontal ligament space on mesial root apex.',
      'Adjacent tooth #18 bone crest levels within normal limits (2mm below CEJ).',
    ],
    radiologistNotes: 'Dr. Alfred G. Roa III, DMD: Clinical thermal test lingering > 15s. Diagnosis: Irreversible pulpitis with symptomatic apical periodontitis.',
  },
  {
    id: 'xray_2',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    date: '2026-10-06',
    type: 'Bitewing',
    teethCovered: 'Left Posterior (#12-#15, #18-#21)',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    findings: [
      'Tooth #14 incipient enamel radiolucency on occlusal fissure.',
      'Restoration margins on previously treated surfaces intact with no recurrent decay.',
      'Alveolar bone height preserved without horizontal crestal bone loss.',
    ],
    radiologistNotes: 'Bitewing demonstrates good interproximal bone density. Conservative light-cure composite indicated on #14.',
  },
  {
    id: 'xray_3',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    date: '2025-04-12',
    type: 'Panoramic',
    teethCovered: 'Full Maxilla and Mandible (32 Tooth Overview)',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    findings: [
      'Bilateral maxillary and mandibular third molars (#1, 16, 17, 32) surgically absent.',
      'Temporomandibular joints (TMJ) condylar head symmetry normal bilaterally.',
      'Maxillary sinuses clear with no mucosal thickening or cysts.',
    ],
    radiologistNotes: 'Baseline panoramic radiograph. No radiopaque pathosis or bony lesions noted.',
  },
];

export const INITIAL_SOAP_NOTES: ClinicalSOAPNote[] = [
  {
    id: 'soap_1',
    patientId: 'user_pat_101',
    dentistId: 'dent_1',
    dentistName: 'Dr. Alfred G. Roa III, DMD',
    date: '2026-10-08',
    subjective: '32 yo female presents at Maasin Dental Spa with dull, throbbing pain in lower left quadrant for 5 days. Sharp exacerbation to cold water and chewing pressure. Reports taking 400mg Ibuprofen with temporary relief.',
    objective: 'Clinical exam by Dr. Alfred Roa III: Tooth #19 has large deep distal caries lesion with cavitated margin. Thermal Endo-Ice test: Positive lingering cold response for 22 seconds (control #20: 3 sec). Percussion test: Mild-to-moderate tenderness. Probing depths: 3-4mm. Periapical radiograph reveals deep caries into pulp horn with mild apical widening.',
    assessment: '1. Tooth #19: Symptomatic Irreversible Pulpitis with Symptomatic Apical Periodontitis (ICD-10 K04.01).\n2. Tooth #14: Enamel Caries, Occlusal (ICD-10 K02.51).',
    plan: '1. Initiate microscope-guided endodontic therapy for Tooth #19.\n2. Local anesthesia: 4% Articaine with 1:100,000 epi via IAN block + 2% Lidocaine infiltration.\n3. Rubber dam isolation placed.\n4. Coronal access completed, canal instrumentation using rotary NiTi files, sodium hypochlorite irrigation.\n5. Post-op e-Rx for Amoxicillin 500mg and Ibuprofen 600mg.\n6. Schedule follow-up visit for crown prep in 2 weeks at Maasin Dental Spa.',
    signedAt: '2026-10-08 10:15 PST (Dr. Alfred G. Roa III, DMD - PRC #0048192)',
  },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx_1',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    medication: 'Amoxicillin',
    dosage: '500 mg Capsule',
    frequency: 'Take 1 capsule every 8 hours by mouth',
    duration: '7 Days',
    quantity: 21,
    refills: 0,
    instructions: 'Take with food or a glass of water. Complete full course even if pain subsides.',
    prescribedBy: 'Dr. Alfred G. Roa III, DMD (PRC: 0048192, PTR: 991823)',
    date: '2026-10-08',
    pharmacyStatus: 'sent',
  },
  {
    id: 'rx_2',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    medication: 'Ibuprofen',
    dosage: '600 mg Tablet',
    frequency: 'Take 1 tablet every 6 hours as needed for dental discomfort',
    duration: '5 Days',
    quantity: 20,
    refills: 0,
    instructions: 'Take with a meal to avoid stomach irritation. Avoid combining with additional NSAIDs.',
    prescribedBy: 'Dr. Alfred G. Roa III, DMD (PRC: 0048192, PTR: 991823)',
    date: '2026-10-08',
    pharmacyStatus: 'sent',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1042',
    invoiceNumber: 'MDS-2026-0891',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    date: '2026-10-08',
    dueDate: '2026-10-22',
    items: [
      {
        description: 'Endodontic Therapy - Molar Tooth #19 (D3330)',
        code: 'D3330',
        amount: 12500,
      },
      {
        description: 'Periapical Diagnostic Radiographs (D0220)',
        code: 'D0220',
        amount: 1200,
      },
    ],
    totalAmount: 13700,
    insurancePortion: 10700,
    patientPortion: 3000,
    status: 'pending',
    installmentPlan: {
      months: 3,
      monthlyAmount: 1000,
      paidMonths: 0,
    },
  },
  {
    id: 'inv_1038',
    invoiceNumber: 'MDS-2026-0740',
    patientId: 'user_pat_101',
    patientName: 'Emma Watson',
    date: '2026-04-12',
    dueDate: '2026-04-26',
    items: [
      {
        description: 'Ultrasonic Dental Spa Cleaning & Prophylaxis (D1110)',
        code: 'D1110',
        amount: 1500,
      },
    ],
    totalAmount: 1500,
    insurancePortion: 1500,
    patientPortion: 0,
    status: 'paid',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_01',
    timestamp: '2026-10-08 09:02:14',
    actorName: 'Dr. Alfred G. Roa III, DMD',
    actorRole: 'dentist',
    action: 'VIEWED_PATIENT_CHART',
    resource: 'Odontogram #19 & Periapical Radiographs',
    patientName: 'Emma Watson',
    ipAddress: '192.168.1.104',
    hipaaComplianceVerified: true,
  },
  {
    id: 'log_02',
    timestamp: '2026-10-08 09:14:48',
    actorName: 'Dr. Alfred G. Roa III, DMD',
    actorRole: 'dentist',
    action: 'CREATED_E_PRESCRIPTION',
    resource: 'Amoxicillin 500mg, Ibuprofen 600mg',
    patientName: 'Emma Watson',
    ipAddress: '192.168.1.104',
    hipaaComplianceVerified: true,
  },
  {
    id: 'log_03',
    timestamp: '2026-10-08 08:35:10',
    actorName: 'Maria Santos (Front Desk)',
    actorRole: 'receptionist',
    action: 'VERIFIED_INSURANCE_ELIGIBILITY',
    resource: 'HMO / Dental Insurance Real-Time Verification',
    patientName: 'David Tan',
    ipAddress: '192.168.1.12',
    hipaaComplianceVerified: true,
  },
  {
    id: 'log_04',
    timestamp: '2026-10-08 08:00:02',
    actorName: 'Dr. Alfred G. Roa III',
    actorRole: 'admin',
    action: 'GENERATED_DAILY_PRODUCTION_REPORT',
    resource: 'Maasin Dental Spa Chair Matrix & Utilization',
    ipAddress: '192.168.1.5',
    hipaaComplianceVerified: true,
  },
];
