import React, { useState } from 'react';
import { api } from '../services/api';
import { User, ModelType, PredictionInput, PredictionResponse, BinaryOption } from '../types';
import { Card, Button, Input } from '../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ChevronRight, Activity, Settings } from 'lucide-react';
import { RecommendationSection } from '../components/Recommendations';

interface AssessmentProps {
  user: User | null;
}

const SYMPTOMS_CONFIG = [
  { key: 'chest_pain', label: 'Chest Pain' },
  { key: 'shortness_of_breath', label: 'Shortness of Breath' },
  { key: 'irregular_heartbeat', label: 'Irregular Heartbeat' },
  { key: 'fatigue_weakness', label: 'Fatigue / Weakness' },
  { key: 'dizziness', label: 'Dizziness' },
  { key: 'swelling_edema', label: 'Swelling (Edema)' },
  { key: 'pain_neck_jaw', label: 'Pain in Neck/Jaw' },
  { key: 'excessive_sweating', label: 'Excessive Sweating' },
  { key: 'persistent_cough', label: 'Persistent Cough' },
  { key: 'nausea_vomiting', label: 'Nausea / Vomiting' },
  { key: 'chest_discomfort_activity', label: 'Chest Discomfort during Activity' },
  { key: 'cold_hands_feet', label: 'Cold Hands / Feet' },
  { key: 'snoring_sleep_apnea', label: 'Snoring / Sleep Apnea' },
  { key: 'anxiety_feeling_doom', label: 'Anxiety / Feeling of Doom' },
];

export const Assessment: React.FC<AssessmentProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelType>(ModelType.RANDOM_FOREST);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  
  // Defaults from Profile
  const defaultAge = user?.personal_defaults?.age;
  const defaultHbp = user?.personal_defaults?.high_blood_pressure;
  const hasDefaults = defaultAge !== undefined && defaultAge !== null && defaultAge > 0 && defaultHbp !== undefined && defaultHbp !== null;

  // Initialize form state
  const [formData, setFormData] = useState<PredictionInput>({
    age: defaultAge || 0,
    high_blood_pressure: (defaultHbp as BinaryOption) || 0,
    stroke_risk_percentage: 50, // Default mid-value, still manual
    chest_pain: 0,
    shortness_of_breath: 0,
    irregular_heartbeat: 0,
    fatigue_weakness: 0,
    dizziness: 0,
    swelling_edema: 0,
    pain_neck_jaw: 0,
    excessive_sweating: 0,
    persistent_cough: 0,
    nausea_vomiting: 0,
    chest_discomfort_activity: 0,
    cold_hands_feet: 0,
    snoring_sleep_apnea: 0,
    anxiety_feeling_doom: 0,
  });

  const handleToggle = (key: keyof PredictionInput) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDefaults) {
      alert("Please set up your profile defaults (Age and Hypertension history) before running an assessment.");
      navigate('/profile');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // Ensure defaults are used even if state drifted (though inputs are hidden)
      const payload = {
        ...formData,
        age: defaultAge!,
        high_blood_pressure: defaultHbp as BinaryOption
      };
      
      const response = await api.predict(model, payload);
      setResult(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskPercentage = (res: PredictionResponse) => {
    const risk = res.probability["at_risk"] ?? res.probability["1"] ?? 0;
    return (risk * 100).toFixed(1);
  };

  const getSafePercentage = (res: PredictionResponse) => {
    const safe = res.probability["not_at_risk"] ?? res.probability["0"] ?? 0;
    return (safe * 100).toFixed(1);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className={`p-8 rounded-2xl text-center shadow-lg border-2 ${result.prediction_score === 1 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${result.prediction_score === 1 ? 'bg-red-100' : 'bg-green-100'} mb-6`}>
            {result.prediction_score === 1 ? <Activity className="h-10 w-10 text-red-600" /> : <CheckCircle className="h-10 w-10 text-green-600" />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{result.prediction_label}</h2>
          <p className="text-slate-600 mb-6">
            Based on the <strong>{result.model_used.replace('_', ' ')}</strong> model analysis.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
             <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Risk Probability</p>
                <p className="text-xl font-bold text-red-600">{getRiskPercentage(result)}%</p>
             </div>
             <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Safe Probability</p>
                <p className="text-xl font-bold text-green-600">{getSafePercentage(result)}%</p>
             </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setResult(null)} variant="outline">Assess Again</Button>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>

        <RecommendationSection isHighRisk={result.prediction_score === 1} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Risk Assessment</h1>
        <p className="text-slate-500">Complete the form below to analyze stroke risk factors.</p>
      </div>

      {!hasDefaults && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800">Profile Setup Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              You must set your <strong>Age</strong> and <strong>Hypertension History</strong> in your profile before running an assessment.
            </p>
            <Link to="/profile" className="inline-block mt-2 text-sm font-medium text-amber-800 underline hover:text-amber-900">
              Go to Profile Setup &rarr;
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-8 ${!hasDefaults ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Section 1: Core Vitals (Read Only + Input) */}
        <Card title="Vitals & Demographics">
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded-md border border-slate-200">
                   <Settings className="h-5 w-5 text-slate-500" />
                 </div>
                 <div>
                   <p className="text-xs font-semibold text-slate-500 uppercase">Profile Defaults</p>
                   <div className="flex gap-4 mt-1">
                     <span className="text-sm font-medium text-slate-900">Age: {defaultAge || '-'}</span>
                     <span className="text-sm text-slate-300">|</span>
                     <span className="text-sm font-medium text-slate-900">Hypertension: {defaultHbp === 1 ? 'Yes' : 'No'}</span>
                   </div>
                 </div>
               </div>
               <Link to="/profile" className="text-sm text-primary-600 font-medium hover:underline">
                 Modify in Profile
               </Link>
            </div>

            <div className="grid md:grid-cols-1 gap-6">
               <Input 
                label="General Health Risk Score (0-100)" 
                name="stroke_risk_percentage" 
                type="number" 
                min="0" 
                max="100"
                step="0.1"
                value={formData.stroke_risk_percentage} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Symptoms Checklist */}
        <Card title="Symptoms & Conditions">
          <p className="text-sm text-slate-500 mb-4">Please select any symptoms you are currently experiencing or have experienced recently.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {SYMPTOMS_CONFIG.map((symptom) => (
              <div 
                key={symptom.key}
                onClick={() => handleToggle(symptom.key as keyof PredictionInput)}
                className={`cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all ${
                  formData[symptom.key as keyof PredictionInput] === 1 
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`text-sm font-medium ${formData[symptom.key as keyof PredictionInput] === 1 ? 'text-primary-900' : 'text-slate-700'}`}>
                  {symptom.label}
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  formData[symptom.key as keyof PredictionInput] === 1 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {formData[symptom.key as keyof PredictionInput] === 1 && <Activity className="w-3 h-3 text-white" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Model Selection */}
        <Card title="Analysis Model">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(ModelType).map((m) => (
              <div 
                key={m}
                onClick={() => setModel(m)}
                className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                  model === m 
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-500' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="capitalize">{m.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-10">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl flex items-center justify-between">
             <div className="hidden md:block text-sm text-slate-500">
                Ensure all data is accurate before submitting.
             </div>
             <Button type="submit" isLoading={loading} disabled={!hasDefaults} className="w-full md:w-auto shadow-lg shadow-primary-500/20">
               Run Analysis <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};