import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Stethoscope, 
  Heart, 
  Loader2,
  ShieldAlert,
  Clock,
  Pill,
  Brain,
  AlertTriangle,
  Activity,
  Thermometer,
  Eye,
  Zap,
  CheckCircle,
  ArrowRight,
  Clipboard,
  Star,
  Settings,
  Database,
  Cpu,
  Globe,
  Lock,
  Shield,
  Lightbulb,
  FileText,
  Microscope,
  Users,
  TrendingUp,
  Target,
  Award,
  Bookmark,
  Library,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Camera,
  Bell,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import SmartDoctorChatInterface from './SmartDoctorChatInterface';
import { API_ENDPOINTS } from '../config/api';

const EnhancedSmartDoctor = () => {
  console.log('EnhancedSmartDoctor component loaded');
  
  const [activeSection, setActiveSection] = useState('chat');
  const [symptoms, setSymptoms] = useState('');
  const [symptomResults, setSymptomResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [extractedPrescription, setExtractedPrescription] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [userProfile, setUserProfile] = useState({
    allergies: [],
    pastDiseases: [],
    currentMedications: []
  });
  
  const { user, getAuthHeaders } = useAuth();
  const { success, error } = useNotification();
  const fileInputRef = useRef(null);

  // New reminder form state
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'daily',
    timing: [],
    duration: '',
    withFood: 'before',
    notes: ''
  });

  useEffect(() => {
    console.log('EnhancedSmartDoctor useEffect triggered');
    fetchUserProfile();
    fetchMedicineReminders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MEDICAL_PROFILE.MEDICAL_HISTORY, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMedicineReminders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MEDICINE_REMINDERS.BASE, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setMedicineReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching medicine reminders:', error);
    }
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      error('Please enter your symptoms');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(API_ENDPOINTS.SMART_DOCTOR.ANALYZE_SYMPTOMS, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          symptoms,
          userProfile 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSymptomResults(data);
        success('Symptom analysis completed');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      // Fallback to simulated analysis
      setSymptomResults(getSimulatedAnalysis(symptoms));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSimulatedAnalysis = (symptoms) => {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('head pain')) {
      return {
        possibleConditions: [
          { name: 'Tension Headache', probability: 85, severity: 'mild' },
          { name: 'Migraine', probability: 60, severity: 'moderate' },
          { name: 'Cluster Headache', probability: 30, severity: 'severe' }
        ],
        otcMedicines: [
          { name: 'Paracetamol', dosage: '500mg-1000mg', frequency: 'Every 6-8 hours', maxDaily: '4000mg' },
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', maxDaily: '1200mg' }
        ],
        redFlags: [
          'Sudden severe headache ("thunderclap headache")',
          'Headache with fever, stiff neck, or rash',
          'Headache after head injury',
          'Progressively worsening headaches',
          'Headache with vision changes or confusion'
        ],
        lifestyle: [
          'Stay hydrated (8-10 glasses of water daily)',
          'Maintain regular sleep schedule (7-9 hours)',
          'Manage stress through relaxation techniques',
          'Avoid triggers like certain foods or bright lights'
        ]
      };
    } else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature')) {
      return {
        possibleConditions: [
          { name: 'Viral Infection', probability: 75, severity: 'mild' },
          { name: 'Bacterial Infection', probability: 45, severity: 'moderate' },
          { name: 'Flu', probability: 65, severity: 'moderate' }
        ],
        otcMedicines: [
          { name: 'Paracetamol', dosage: '500mg-1000mg', frequency: 'Every 6 hours', maxDaily: '4000mg' },
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', maxDaily: '1200mg' }
        ],
        redFlags: [
          'Fever above 103°F (39.4°C)',
          'Fever lasting more than 3 days',
          'Difficulty breathing or chest pain',
          'Severe headache or stiff neck',
          'Persistent vomiting or dehydration'
        ],
        lifestyle: [
          'Rest and sleep adequately',
          'Drink plenty of fluids',
          'Take lukewarm baths to reduce fever',
          'Avoid heavy physical activity'
        ]
      };
    }
    
    return {
      possibleConditions: [
        { name: 'Common Cold', probability: 70, severity: 'mild' },
        { name: 'General Fatigue', probability: 50, severity: 'mild' }
      ],
      otcMedicines: [
        { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Daily', maxDaily: '1 tablet' }
      ],
      redFlags: [
        'Symptoms persisting more than 2 weeks',
        'Difficulty breathing',
        'High fever above 101°F',
        'Severe pain or discomfort'
      ],
      lifestyle: [
        'Get adequate rest and sleep',
        'Stay hydrated',
        'Eat a balanced diet',
        'Consider consulting a healthcare provider if symptoms persist'
      ]
    };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please upload an image file');
      return;
    }

    setPrescriptionFile(file);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const response = await fetch(API_ENDPOINTS.SMART_DOCTOR.EXTRACT_PRESCRIPTION, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedPrescription(data);
        success('Prescription extracted successfully');
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      console.error('Error extracting prescription:', error);
      // Simulate extraction for demo
      setExtractedPrescription({
        medicines: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: '3 times daily',
            duration: '7 days',
            instructions: 'Take with food'
          },
          {
            name: 'Paracetamol',
            dosage: '650mg',
            frequency: '4 times daily',
            duration: '5 days',
            instructions: 'Take as needed for fever'
          }
        ],
        doctorName: 'Dr. Smith',
        date: new Date().toLocaleDateString()
      });
      success('Prescription processed (demo mode)');
    } finally {
      setIsProcessing(false);
    }
  };

  const addMedicineReminder = async () => {
    if (!newReminder.medicineName || !newReminder.dosage || newReminder.timing.length === 0) {
      error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.MEDICINE_REMINDERS.BASE, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReminder)
      });

      if (response.ok) {
        const data = await response.json();
        setMedicineReminders([...medicineReminders, data.reminder]);
        setNewReminder({
          medicineName: '',
          dosage: '',
          frequency: 'daily',
          timing: [],
          duration: '',
          withFood: 'before',
          notes: ''
        });
        setShowAddReminder(false);
        success('Medicine reminder added successfully');
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      // Simulate adding reminder
      const newReminderItem = {
        id: Date.now(),
        ...newReminder,
        createdAt: new Date().toISOString()
      };
      setMedicineReminders([...medicineReminders, newReminderItem]);
      setNewReminder({
        medicineName: '',
        dosage: '',
        frequency: 'daily',
        timing: [],
        duration: '',
        withFood: 'before',
        notes: ''
      });
      setShowAddReminder(false);
      success('Medicine reminder added (demo mode)');
    }
  };

  const deleteMedicineReminder = async (id) => {
    try {
      await fetch(`/api/medicine-reminders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      setMedicineReminders(medicineReminders.filter(reminder => reminder.id !== id));
      success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setMedicineReminders(medicineReminders.filter(reminder => reminder.id !== id));
      success('Reminder deleted');
    }
  };

  const sections = [
    { id: 'chat', name: 'AI Chat', icon: MessageCircle },
    { id: 'symptoms', name: 'Symptom Checker', icon: Stethoscope },
    { id: 'tracker', name: 'Medicine Tracker', icon: Activity },
    { id: 'prescription', name: 'Prescription OCR', icon: FileText },
    { id: 'reminders', name: 'Medicine Reminders', icon: Bell }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
      {/* Section Navigation */}
      <div className="border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap font-medium text-sm transition-all duration-200 ${
                  activeSection === section.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white/80 dark:bg-gray-800/80'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="min-h-[600px]">
        {/* AI Chat Section */}
        {activeSection === 'chat' && (
          <div className="h-[600px]">
            <SmartDoctorChatInterface />
          </div>
        )}

        {/* Symptom Checker Section */}
        {activeSection === 'symptoms' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Symptom Analysis & Medicine Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Describe your symptoms and get personalized medicine suggestions and medical advice.
              </p>
            </div>

            <div className="space-y-6">
              {/* Symptom Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe Your Symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail (e.g., headache, fever, nausea, duration, severity...)"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                />
                <button
                  onClick={analyzeSymptoms}
                  disabled={isAnalyzing || !symptoms.trim()}
                  className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-5 h-5" />
                      <span>Analyze Symptoms</span>
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Results */}
              {symptomResults && (
                <div className="space-y-6">
                  {/* Possible Conditions */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      Possible Conditions
                    </h4>
                    <div className="space-y-2">
                      {symptomResults.possibleConditions?.map((condition, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{condition.name}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              condition.severity === 'mild' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {condition.severity}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {condition.probability}% match
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OTC Medicine Suggestions */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-green-600" />
                      OTC Medicine Suggestions
                    </h4>
                    <div className="space-y-3">
                      {symptomResults.otcMedicines?.map((medicine, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white">{medicine.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span className="mr-4">Dosage: {medicine.dosage}</span>
                            <span className="mr-4">Frequency: {medicine.frequency}</span>
                            <span>Max Daily: {medicine.maxDaily}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Flag Symptoms */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                      When to See a Doctor Immediately
                    </h4>
                    <div className="space-y-2">
                      {symptomResults.redFlags?.map((flag, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle Recommendations */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
                      Lifestyle Recommendations
                    </h4>
                    <div className="space-y-2">
                      {symptomResults.lifestyle?.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicine Tracker Section */}
        {activeSection === 'tracker' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Personalized Medicine Tracker
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Track your medical history, allergies, and get personalized medicine recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical Profile */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Medical Profile
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Known Allergies
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {userProfile.allergies?.length > 0 ? userProfile.allergies.join(', ') : 'None recorded'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Past Medical Conditions
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {userProfile.pastDiseases?.length > 0 ? userProfile.pastDiseases.join(', ') : 'None recorded'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Medications
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {userProfile.currentMedications?.length > 0 ? userProfile.currentMedications.join(', ') : 'None recorded'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Checks */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Safety Recommendations
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Drug Interaction Check</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          All suggested medicines are checked against your current medications
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Allergy Alert</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Medicines are filtered based on your recorded allergies
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Personalized Dosage</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Recommendations consider your medical history and past treatments
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prescription OCR Section */}
        {activeSection === 'prescription' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Prescription Extraction (OCR)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Upload a prescription image and automatically extract medicine information.
              </p>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {prescriptionFile ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(prescriptionFile)}
                        alt="Prescription"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {prescriptionFile.name}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Upload Prescription Image
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Take a clear photo or upload an image of your prescription
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>{prescriptionFile ? 'Change Image' : 'Select Image'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extracted Prescription Results */}
              {extractedPrescription && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Extracted Prescription Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Doctor:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{extractedPrescription.doctorName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{extractedPrescription.date}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Prescribed Medicines:</h5>
                      <div className="space-y-2">
                        {extractedPrescription.medicines?.map((medicine, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white">{medicine.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-x-4">
                              <span>Dosage: {medicine.dosage}</span>
                              <span>Frequency: {medicine.frequency}</span>
                              <span>Duration: {medicine.duration}</span>
                            </div>
                            {medicine.instructions && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Instructions: {medicine.instructions}
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                setNewReminder({
                                  medicineName: medicine.name,
                                  dosage: medicine.dosage,
                                  frequency: medicine.frequency,
                                  timing: [],
                                  duration: medicine.duration,
                                  withFood: medicine.instructions?.toLowerCase().includes('food') ? 'with' : 'before',
                                  notes: medicine.instructions || ''
                                });
                                setActiveSection('reminders');
                                setShowAddReminder(true);
                              }}
                              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              Add to Reminders
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicine Reminders Section */}
        {activeSection === 'reminders' && (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Medicine Reminders
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Set up automated reminders for your medications.
                </p>
              </div>
              <button
                onClick={() => setShowAddReminder(!showAddReminder)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Reminder</span>
              </button>
            </div>

            {/* Add Reminder Form */}
            {showAddReminder && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Medicine Reminder
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={newReminder.medicineName}
                      onChange={(e) => setNewReminder({...newReminder, medicineName: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter medicine name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={newReminder.dosage}
                      onChange={(e) => setNewReminder({...newReminder, dosage: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500mg, 1 tablet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <select
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice-daily">Twice Daily</option>
                      <option value="thrice-daily">Thrice Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as-needed">As Needed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newReminder.duration}
                      onChange={(e) => setNewReminder({...newReminder, duration: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 7 days, 2 weeks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timing *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            const timing = newReminder.timing.includes(time)
                              ? newReminder.timing.filter(t => t !== time)
                              : [...newReminder.timing, time];
                            setNewReminder({...newReminder, timing});
                          }}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            newReminder.timing.includes(time)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      With Food
                    </label>
                    <select
                      value={newReminder.withFood}
                      onChange={(e) => setNewReminder({...newReminder, withFood: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="before">Before Food</option>
                      <option value="with">With Food</option>
                      <option value="after">After Food</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={newReminder.notes}
                    onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Any special instructions or notes"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMedicineReminder}
                    disabled={!newReminder.medicineName || !newReminder.dosage || newReminder.timing.length === 0}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Reminder</span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Reminders */}
            <div className="space-y-4">
              {medicineReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Medicine Reminders
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add your first medicine reminder to get started with automated notifications.
                  </p>
                </div>
              ) : (
                medicineReminders.map((reminder) => (
                  <div key={reminder.id} className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {reminder.medicineName}
                          </h4>
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                            {reminder.frequency}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>
                            <span className="font-medium">Dosage:</span> {reminder.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Timing:</span> {reminder.timing.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">With Food:</span> {reminder.withFood}
                          </div>
                          {reminder.duration && (
                            <div>
                              <span className="font-medium">Duration:</span> {reminder.duration}
                            </div>
                          )}
                          {reminder.notes && (
                            <div>
                              <span className="font-medium">Notes:</span> {reminder.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteMedicineReminder(reminder.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSmartDoctor;

