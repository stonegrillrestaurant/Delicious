import { GoogleGenAI } from '@google/genai';
import { AiTriageResult } from '../types/dental';

// Safely obtain API key from Vite or process env
const getApiKey = (): string | undefined => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    // @ts-ignore
    return process.env.GEMINI_API_KEY;
  }
  return undefined;
};

/**
 * AI Dental Triage & Urgency Evaluation
 * Evaluates symptoms, classifies urgency, maps to CDT procedure, and gives clear pre-appointment guidance.
 */
export async function triageDentalSymptoms(
  symptomsText: string,
  patientPainLevel: number, // 1-10
  duration: string,
  swellingPresent: boolean
): Promise<AiTriageResult> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the lead dental decision engine for Maasin Dental Spa (led by Dr. Alfred G. Roa III, DMD in Maasin, Southern Leyte).
Analyze the following patient reported dental symptoms:
- Patient Description: "${symptomsText}"
- Self-Reported Pain Level: ${patientPainLevel}/10
- Duration of symptoms: "${duration}"
- Visible facial or gum swelling present: ${swellingPresent ? 'YES' : 'NO'}

Return ONLY a valid JSON object matching this TypeScript interface without markdown wrappers:
{
  "urgencyLevel": "Emergency" | "Urgent" | "Routine" | "Non-Urgent",
  "urgencyScore": number (1-100),
  "clinicalSummary": string (2-3 sentences explaining probable etiology),
  "possibleConditions": string[] (2-3 potential dental conditions),
  "suggestedCdtCode": string (e.g. "D0140" or "D3330" or "D0120"),
  "suggestedServiceName": string (e.g. "Emergency Dental Pain Evaluation & Digital Radiograph" or "Molar Endodontic Therapy"),
  "recommendedSpecialist": string ("Dr. Alfred G. Roa III, DMD (Maasin Dental Spa)"),
  "homeCareAdvice": string[] (3 actionable safe comfort measures, e.g. cold compress, salt water rinse),
  "warningFlags": string[] (red flag signs requiring immediate attention)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Clean JSON if model returned markdown codeblocks
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as AiTriageResult;
      return parsed;
    } catch (err) {
      console.warn('Gemini API call returned error or fallback used:', err);
    }
  }

  // Clinical Heuristic Fallback
  return generateClinicalHeuristicTriage(symptomsText, patientPainLevel, duration, swellingPresent);
}

function generateClinicalHeuristicTriage(
  symptoms: string,
  pain: number,
  _duration: string,
  swelling: boolean
): AiTriageResult {
  const lower = symptoms.toLowerCase();
  const isTrauma = lower.includes('knocked') || lower.includes('broken') || lower.includes('hit') || lower.includes('fall');
  const isPulpitis = lower.includes('throbbing') || lower.includes('cold') || lower.includes('hot') || lower.includes('nerve') || lower.includes('root');
  const isGum = lower.includes('bleeding') || lower.includes('gum') || lower.includes('floss');

  if (swelling || pain >= 8 || isTrauma) {
    return {
      urgencyLevel: swelling ? 'Emergency' : 'Urgent',
      urgencyScore: swelling ? 95 : 82,
      clinicalSummary: swelling
        ? 'Suspected acute periapical or periodontal abscess with active facial/intraoral swelling. Prompt drainage and evaluation is required to prevent spatial spread.'
        : 'Acute pulpitis or dental trauma with significant neurovascular involvement requiring same-day dental intervention and periapical imaging.',
      possibleConditions: [
        'Acute Periapical Abscess (K04.7)',
        'Symptomatic Irreversible Pulpitis (K04.01)',
        'Traumatic Dental Fracture (S02.5)',
      ],
      suggestedCdtCode: 'D0140/D0220',
      suggestedServiceName: 'Emergency Dental Pain Evaluation & Digital Radiograph',
      recommendedSpecialist: 'Dr. Alfred G. Roa III, DMD (Maasin Dental Spa)',
      homeCareAdvice: [
        'Apply an external cold pack for 15-minute intervals to reduce swelling. Never apply direct heat.',
        'Rinse mouth gently with warm saline solution (1/2 tsp salt in 8oz warm water).',
        'Keep your head elevated on extra pillows when resting to decrease vascular pressure.',
      ],
      warningFlags: [
        'Difficulty swallowing, speaking, or breathing requires immediate emergency attention.',
        'Fever or swelling rapidly spreading toward the jawline or eye.',
      ],
    };
  }

  if (isPulpitis || pain >= 5) {
    return {
      urgencyLevel: 'Urgent',
      urgencyScore: 72,
      clinicalSummary:
        'Symptoms indicate probable pulpal inflammation, possibly secondary to deep caries or microfracture. Thermal sensitivity lingering beyond stimulus cessation suggests pulpal compromise.',
      possibleConditions: [
        'Irreversible Pulpitis (K04.0)',
        'Deep Occlusal/Interproximal Caries (K02.5)',
        'Cracked Tooth Syndrome (K03.81)',
      ],
      suggestedCdtCode: 'D3330',
      suggestedServiceName: 'Molar Endodontic Therapy (Root Canal Treatment)',
      recommendedSpecialist: 'Dr. Alfred G. Roa III, DMD (Maasin Dental Spa)',
      homeCareAdvice: [
        'Avoid extreme cold, hot, acidic, and sugary foods that trigger pulpal stimulation.',
        'Chew predominantly on the opposite side of the mouth to prevent occlusal loading.',
        'Over-the-counter pain relief (e.g. Mefenamic acid or Ibuprofen) if medically appropriate for temporary comfort.',
      ],
      warningFlags: [
        'Sudden severe throbbing that wakes you from sleep.',
        'Development of a pimple-like bump (fistula) on the gum line.',
      ],
    };
  }

  if (isGum) {
    return {
      urgencyLevel: 'Routine',
      urgencyScore: 40,
      clinicalSummary:
        'Signs of localized gingival inflammation or early periodontal pocketing. Ultrasonic cleaning and subgingival debridement will help reverse tissue irritation.',
      possibleConditions: [
        'Gingivitis (K05.00)',
        'Subgingival Calculus Deposition',
        'Localized Periodontitis',
      ],
      suggestedCdtCode: 'D4341',
      suggestedServiceName: 'Periodontal Deep Cleaning (Scaling & Root Planing)',
      recommendedSpecialist: 'Dr. Alfred G. Roa III, DMD (Maasin Dental Spa)',
      homeCareAdvice: [
        'Continue brushing twice daily with a soft-bristled electric toothbrush along the 45° sulcus angle.',
        'Use an alcohol-free antibacterial or warm saltwater mouthwash.',
        'Do not stop flossing even if slight bleeding occurs, as plaque removal is essential.',
      ],
      warningFlags: [
        'Persistent spontaneous bleeding without mechanical provocation.',
        'Noticeable tooth mobility or shifting teeth.',
      ],
    };
  }

  return {
    urgencyLevel: 'Routine',
    urgencyScore: 25,
    clinicalSummary:
      'Symptoms are consistent with routine preventative oral maintenance, mild aesthetic concern, or early preventative checkup.',
    possibleConditions: [
      'Preventive Dental Maintenance',
      'Mild Enamel Staining',
      'Routine Calculus Accumulation',
    ],
    suggestedCdtCode: 'D0120/D1110',
    suggestedServiceName: 'Comprehensive Oral Exam & Ultrasonic Cleaning',
    recommendedSpecialist: 'Dr. Alfred G. Roa III, DMD (Maasin Dental Spa)',
    homeCareAdvice: [
      'Maintain diligent daily oral hygiene with fluoridated or hydroxyapatite toothpaste.',
      'Floss daily before bedtime to remove interproximal biofilm.',
      'Drink plenty of fluoridated tap water and minimize sipping on acidic beverages.',
    ],
    warningFlags: ['Development of spontaneous sharp pain or swelling.'],
  };
}

/**
 * AI Natural Language / Voice Booking Parser
 * Parses natural sentences like "I need a cleaning next Tuesday with Dr. Chen at 2pm"
 */
export async function parseNaturalLanguageBooking(input: string): Promise<{
  serviceKeywords?: string;
  doctorName?: string;
  preferredDay?: string;
  preferredTime?: string;
  urgency?: string;
}> {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Parse this dental patient booking request: "${input}".
Extract intent into a JSON object:
{
  "serviceKeywords": string or null (e.g. "cleaning", "root canal", "whitening", "emergency"),
  "doctorName": string or null (e.g. "Dr. Miller", "Dr. Chen", "Dr. Patel"),
  "preferredDay": string or null (e.g. "Tuesday", "Tomorrow", "Thursday"),
  "preferredTime": string or null (e.g. "14:00", "afternoon", "morning", "10:30"),
  "urgency": string or null (e.g. "urgent", "routine", "emergency")
}
Return only JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const cleaned = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini booking parse fallback:', e);
    }
  }

  // Fallback parsing
  const lower = input.toLowerCase();
  let serviceKeywords = 'cleaning';
  if (lower.includes('root canal') || lower.includes('toothache') || lower.includes('pain')) serviceKeywords = 'root canal';
  else if (lower.includes('crown')) serviceKeywords = 'crown';
  else if (lower.includes('whiten')) serviceKeywords = 'whitening';
  else if (lower.includes('emergency')) serviceKeywords = 'emergency';

  let doctorName = 'Dr. Alfred G. Roa III, DMD';
  if (lower.includes('tan')) doctorName = 'Dr. Kristina Tan, DMD';

  let preferredTime = '10:30';
  if (lower.includes('afternoon') || lower.includes('pm') || lower.includes('2') || lower.includes('3')) {
    preferredTime = '14:00';
  }

  return {
    serviceKeywords,
    doctorName,
    preferredDay: 'Thursday',
    preferredTime,
    urgency: lower.includes('emergency') || lower.includes('urgent') ? 'urgent' : 'routine',
  };
}

/**
 * AI Treatment Plan Plain-English Explainer
 * Converts complex dental diagnosis & CDT codes into empathetic, reassuring language for the patient.
 */
export async function explainTreatmentPlan(planDetails: string): Promise<string> {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a warm, highly reassuring patient educator at Maasin Dental Spa (led by Dr. Alfred G. Roa III, DMD in Maasin, Southern Leyte).
A patient has the following treatment plan:
${planDetails}

Write a 2-3 paragraph explanation in clear, simple, human English:
1. Explain WHY each step is recommended in plain language (no intimidating dental jargon).
2. Explain the benefits to their long-term smile and health.
3. Reassure them about comfort and modern gentle anesthesia.
Keep the tone encouraging, professional, and clear.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text) return response.text.trim();
    } catch (e) {
      console.warn('Gemini treatment explainer fallback:', e);
    }
  }

  return `We designed your customized treatment plan to prioritize your comfort, relieve any pain, and preserve your natural smile for the long term. 

In Phase 1, we gently resolve the nerve pressure in your molar to give you immediate, lasting relief. Thanks to modern microscopic techniques and localized comfort numbing, the procedure feels no different than getting a simple routine filling. 

In Phase 2, we rebuild the tooth structure and place a custom ceramic crown that perfectly matches your natural teeth, restoring 100% of your chewing strength. Finally, a small cosmetic composite filling will stop the early cavity in its tracks before it can reach any sensitive nerves.`;
}
