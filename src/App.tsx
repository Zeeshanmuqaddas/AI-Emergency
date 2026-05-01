import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, HeartPulse, Thermometer, AlertTriangle, AlertCircle, Ambulance, Hospital, Info, ChevronRight, Stethoscope } from 'lucide-react';
import { analyzeTriage, TriageData, TriageResult } from './lib/gemini';

export default function App() {
  const [formData, setFormData] = useState<TriageData>({
    age: 30,
    heart_rate: 80,
    oxygen: 98,
    symptoms: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'symptoms' ? value : Number(value)
    }));
  };

  const calculateRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-700 shadow-red-900/50';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-600 shadow-orange-900/50';
      case 'MODERATE': return 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-yellow-900/50';
      case 'LOW': return 'bg-green-500 text-white border-green-600 shadow-green-900/50';
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const calculateRiskTextColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-500';
      case 'MODERATE': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      setError("Please describe the patient's symptoms.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setTriageResult(null);
    
    try {
      const result = await analyzeTriage(formData);
      setTriageResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during triage analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Warning Banner */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-center text-amber-800 text-sm font-medium">
        <AlertTriangle className="w-4 h-4 mr-2" />
        <p>NOT A MEDICAL DIAGNOSIS. AI Emergency Triage System is for decision support only. In a real emergency, call local emergency services.</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Emergency Triage Orchestrator
          </h1>
          <p className="mt-2 text-neutral-600">Enter patient vitals and symptoms for rapid risk assessment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                <h2 className="text-lg font-semibold flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-neutral-500" />
                  Patient Data Intake
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 flex items-center">
                      Age (years)
                    </label>
                    <input 
                      type="number" 
                      name="age" 
                      min="0"
                      max="120"
                      value={formData.age} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 flex items-center">
                      <HeartPulse className="w-4 h-4 mr-1 text-rose-500" />
                      Heart Rate (bpm)
                    </label>
                    <input 
                      type="number" 
                      name="heart_rate" 
                      min="0"
                      max="300"
                      value={formData.heart_rate} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 flex items-center">
                    <Thermometer className="w-4 h-4 mr-1 text-sky-500" />
                    SpO2 Oxygen (%)
                  </label>
                  <input 
                    type="number" 
                    name="oxygen" 
                    min="0"
                    max="100"
                    value={formData.oxygen} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Chief Complaint / Symptoms
                  </label>
                  <textarea 
                    name="symptoms" 
                    value={formData.symptoms} 
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe symptoms (e.g., 'Severe chest pain radiating to left arm, sweating, shortness of breath...')"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isAnalyzing}
                  className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                      Analyzing Risk Profile...
                    </>
                  ) : (
                    <>
                      Run Triage Analysis
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!triageResult && !isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center p-8 text-center bg-white/50"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Awaiting Patient Data</h3>
                  <p className="text-neutral-500 max-w-sm">Enter vitals and symptoms on the left to generate an immediate risk assessment and routing recommendation.</p>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border border-neutral-200 flex flex-col items-center justify-center p-8 text-center bg-white shadow-sm"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-6 relative"
                  >
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full"
                    />
                    <Activity className="w-10 h-10 text-blue-500" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-neutral-900 mb-2">Analyzing Data Streams</h3>
                  <p className="text-neutral-500">Cross-referencing triage protocols and symptom patterns...</p>
                </motion.div>
              ) : triageResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden"
                >
                  {/* Risk Level Header */}
                  <div className={`p-6 border-b flex items-center justify-between transition-colors ${calculateRiskColor(triageResult.risk_assessment.level)}`}>
                    <div>
                      <p className="text-sm font-medium opacity-90 mb-1 uppercase tracking-wider">Triage Priority</p>
                      <h2 className="text-3xl font-bold tracking-tight">
                        {triageResult.risk_assessment.level} RISK
                        {triageResult.risk_assessment.level.toUpperCase() === 'CRITICAL' && (
                          <motion.span 
                            animate={{ opacity: [1, 0, 1] }} 
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="inline-block ml-3 w-3 h-3 bg-white rounded-full align-middle"
                          />
                        )}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium opacity-90 mb-1 uppercase tracking-wider">Severity Score</p>
                      <div className="text-4xl font-black tabular-nums tracking-tighter">
                        {triageResult.risk_assessment.score}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    
                    {/* Action & Routing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className={`p-5 rounded-xl border ${triageResult.risk_assessment.level.toUpperCase() === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-neutral-50 border-neutral-200'}`}>
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg mr-3 ${triageResult.risk_assessment.level.toUpperCase() === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
                            <Ambulance className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-neutral-900">Required Action</h3>
                        </div>
                        <p className={`font-medium ${calculateRiskTextColor(triageResult.risk_assessment.level)}`}>
                          {triageResult.emergency_action.action.toUpperCase()}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-white rounded-lg border border-blue-100 mr-3 text-blue-600">
                            <Hospital className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-neutral-900">Hospital Routing</h3>
                        </div>
                        <p className="font-medium text-blue-800">
                          {triageResult.hospital_recommendation.type.toUpperCase()}
                        </p>
                      </div>

                    </div>

                    {/* Symptoms Analysis */}
                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b pb-2">Diagnostic Insights</h3>
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 mb-3">
                          Category: {triageResult.symptoms_analysis.category}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {triageResult.symptoms_analysis.normalized.map((sym, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border border-neutral-200 text-neutral-600 rounded-md text-sm shadow-sm">
                              {sym}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                          <Info className="w-4 h-4 mr-2 text-indigo-500" />
                          Possible Conditions (Differential)
                        </h4>
                        <ul className="space-y-2">
                          {triageResult.possible_conditions.map((cond, idx) => (
                            <li key={idx} className="text-sm text-indigo-800 flex items-start">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2.5 mt-1.5 shrink-0" />
                              {cond}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500 text-center leading-relaxed">
                        {triageResult.medical_warning}
                      </p>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
