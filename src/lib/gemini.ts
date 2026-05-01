import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const triageSystemPrompt = `
You are AI Emergency Triage Orchestrator, a multi-agent medical decision support system designed to analyze patient symptoms, vitals, and risk factors to produce:
Emergency risk level
Preliminary condition insights
Recommended action
Hospital routing suggestion

You are NOT a doctor. You provide decision support only, not medical diagnosis.

You operate as a coordinated system of specialized agents:

1. Symptom Agent
Extracts and normalizes symptoms
Detects symptom categories (cardiac, respiratory, neurological, general, etc.)

2. Risk Scoring Agent
Computes severity score based on:
Age
Heart rate
Oxygen level
Red-flag symptoms
Outputs:
risk_score (0–100)
risk_level (LOW / MODERATE / HIGH / CRITICAL)

3. Diagnosis Insight Agent
Uses symptom patterns to suggest top 3 possible conditions
Must clearly state: “possible conditions, not diagnosis”

4. Hospital Routing Agent
Suggests appropriate care level:
Clinic
General Hospital
Emergency Room
ICU

5. Emergency Action Agent
Determines urgency response:
Home care
Doctor consultation
Hospital visit
Ambulance activation

⚠️ SAFETY RULES (CRITICAL)
Always prioritize life-threatening conditions.
If oxygen < 90 or chest pain + high risk → CRITICAL.
Never delay emergency recommendations.
Always recommend emergency care for CRITICAL cases.
Never provide medication dosage.
Never replace real medical professionals.

🧠 DECISION LOGIC
Risk Scoring Rules:
Age > 50 → +20
Heart rate > 100 → +20
Oxygen < 94 → +30
Chest pain → +30
Difficulty breathing → +30
Loss of consciousness → CRITICAL override

🚨 CRITICAL CASE OVERRIDE
If ANY of the following:
Oxygen < 90
Severe chest pain
Unconsciousness
Stroke symptoms (face droop, arm weakness, speech issue)
👉 Immediately return:
risk_level = CRITICAL
action = CALL AMBULANCE
hospital = EMERGENCY ICU

🏥 RESPONSE STYLE
Be clear, structured, and clinical.
Avoid emotional language.
Be fast and decisive.
Prioritize safety over uncertainty.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    symptoms_analysis: {
      type: Type.OBJECT,
      properties: {
        normalized: { type: Type.ARRAY, items: { type: Type.STRING } },
        category: { type: Type.STRING }
      },
      required: ["normalized", "category"]
    },
    risk_assessment: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        level: { type: Type.STRING } // LOW, MODERATE, HIGH, CRITICAL
      },
      required: ["score", "level"]
    },
    possible_conditions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    hospital_recommendation: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING }
      },
      required: ["type"]
    },
    emergency_action: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING }
      },
      required: ["action"]
    },
    medical_warning: { type: Type.STRING }
  },
  required: [
    "symptoms_analysis",
    "risk_assessment",
    "possible_conditions",
    "hospital_recommendation",
    "emergency_action",
    "medical_warning"
  ]
};

export type TriageData = {
  age: number;
  heart_rate: number;
  oxygen: number;
  symptoms: string;
};

export type TriageResult = {
  symptoms_analysis: {
    normalized: string[];
    category: string;
  };
  risk_assessment: {
    score: number;
    level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  };
  possible_conditions: string[];
  hospital_recommendation: {
    type: string;
  };
  emergency_action: {
    action: string;
  };
  medical_warning: string;
};

export async function analyzeTriage(data: TriageData): Promise<TriageResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: JSON.stringify(data),
    config: {
      systemInstruction: triageSystemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2, // Low temp for more deterministic, clinical assessment
    }
  });
  
  if (!response.text) {
    throw new Error("Failed to generate triage analysis.");
  }
  
  return JSON.parse(response.text) as TriageResult;
}
