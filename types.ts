// API Response Types

export interface User {
  id: string;
  email: string;
  full_name: string;
  personal_defaults?: PersonalDefaults | null;
}

export interface PersonalDefaults {
  age?: number | null;
  high_blood_pressure?: number | null; // 0 or 1
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// 0 = No, 1 = Yes
export type BinaryOption = 0 | 1;

export interface PredictionInput {
  // Numerical
  age: number;
  stroke_risk_percentage: number; // 0-100 (e.g. from general health assessment)
  
  // Binary Conditions
  high_blood_pressure: BinaryOption;
  heart_disease?: BinaryOption; // Sometimes used in datasets, mapping strictly to provided API fields below
  
  // API Specific Binary Fields
  chest_pain: BinaryOption;
  shortness_of_breath: BinaryOption;
  irregular_heartbeat: BinaryOption;
  fatigue_weakness: BinaryOption;
  dizziness: BinaryOption;
  swelling_edema: BinaryOption;
  pain_neck_jaw: BinaryOption;
  excessive_sweating: BinaryOption;
  persistent_cough: BinaryOption;
  nausea_vomiting: BinaryOption;
  chest_discomfort_activity: BinaryOption;
  cold_hands_feet: BinaryOption;
  snoring_sleep_apnea: BinaryOption;
  anxiety_feeling_doom: BinaryOption;
}

export interface PredictionResponse {
  model_used: string;
  prediction_label: "At Risk" | "Not At Risk" | string;
  prediction_score: number; // 0 or 1
  probability: {
    [key: string]: number; // e.g., "0": 0.1, "1": 0.9, or "at_risk": 0.9
  };
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  model_used: string;
  prediction_label: string;
  prediction_score: number;
}

export interface HistoryDetail extends HistoryItem {
  input_data: PredictionInput;
  probability: Record<string, number>;
}

export enum ModelType {
  LOGISTIC = 'logistic',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm'
}

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[];
}