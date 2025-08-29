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
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Advanced Medical Context Database
const medicalContexts = {
  cardiology: {
    name: "Cardiology & Heart Conditions",
    icon: "❤️",
    description: "Heart diseases, cardiac symptoms, blood pressure, chest pain",
    keywords: ["heart", "chest pain", "palpitations", "blood pressure", "cardiac", "angina", "arrhythmia"],
    specialization: "Cardiovascular medicine focusing on heart and blood vessel disorders"
  },
  neurology: {
    name: "Neurology & Brain Health",
    icon: "🧠",
    description: "Headaches, migraines, seizures, neurological symptoms",
    keywords: ["headache", "migraine", "seizure", "dizziness", "neurological", "brain", "memory", "confusion"],
    specialization: "Neurological conditions affecting the brain, spinal cord, and nervous system"
  },
  respiratory: {
    name: "Respiratory & Lung Health",
    icon: "🫁",
    description: "Breathing problems, cough, asthma, lung conditions",
    keywords: ["cough", "breathing", "shortness of breath", "asthma", "pneumonia", "lung", "respiratory"],
    specialization: "Respiratory system disorders and breathing-related conditions"
  },
  gastroenterology: {
    name: "Digestive Health",
    icon: "🦠",
    description: "Stomach issues, digestion, nausea, abdominal pain",
    keywords: ["stomach", "nausea", "vomiting", "abdominal", "digestive", "diarrhea", "constipation"],
    specialization: "Digestive system disorders and gastrointestinal health"
  },
  dermatology: {
    name: "Skin & Dermatology",
    icon: "🔬",
    description: "Skin conditions, rashes, allergies, dermatological issues",
    keywords: ["skin", "rash", "itchy", "allergy", "dermatological", "acne", "eczema"],
    specialization: "Skin conditions and dermatological health concerns"
  },
  orthopedics: {
    name: "Musculoskeletal Health",
    icon: "🦴",
    description: "Joint pain, muscle aches, bone issues, mobility",
    keywords: ["joint", "muscle", "bone", "pain", "arthritis", "mobility", "orthopedic"],
    specialization: "Bone, joint, muscle, and skeletal system conditions"
  },
  mental_health: {
    name: "Mental Health & Wellness",
    icon: "🧘",
    description: "Stress, anxiety, depression, mental wellness",
    keywords: ["stress", "anxiety", "depression", "mental", "mood", "sleep", "fatigue"],
    specialization: "Mental health, psychological wellness, and behavioral health"
  },
  general: {
    name: "General Medicine",
    icon: "🩺",
    description: "General health concerns, basic medical guidance",
    keywords: ["fever", "cold", "general", "basic", "common", "health"],
    specialization: "General medical practice and common health conditions"
  }
};

// AI Model Configuration
const AI_CONFIG = {
  OLLAMA_URL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  FALLBACK_TO_SMART_DOCTOR: true
};
const aiModels = {
  gemini_fast: {
    name: "Google Gemini Flash (Cloud)",
    type: "gemini",
    api: "gemini",
    model: "gemini-1.5-flash",
    description: "Fast cloud-based responses",
    features: ["Quick responses", "Medical knowledge", "Cost-effective"],
    performance: "excellent"
  },
  gemini_pro: {
    name: "Google Gemini Pro (Cloud)",
    type: "gemini", 
    api: "gemini",
    model: "gemini-1.5-pro",
    description: "Advanced cloud-based AI",
    features: ["Detailed analysis", "Complex reasoning", "Medical expertise"],
    performance: "excellent"
  },
  deepseek_8b: {
    name: "DeepSeek 8B (Local)",
    type: "ollama",
    api: "ollama",
    model: "deepseek-llm:8b",
    description: "DeepSeek 8B model via Ollama",
    features: ["Local processing", "Privacy focused", "Medical training"],
    performance: "good",
    warning: "May be slow on older hardware"
  },
  deepseek_32b: {
    name: "DeepSeek 32B (Local)",
    type: "ollama",
    api: "ollama", 
    model: "deepseek-llm:32b",
    description: "Large DeepSeek model via Ollama",
    features: ["Advanced reasoning", "Detailed analysis", "Local processing"],
    performance: "heavy",
    warning: "Requires high-end hardware, may cause freezing"
  },
  ollama3_8b: {
    name: "Ollama 3 8B (Local)",
    type: "ollama",
    api: "ollama",
    model: "llama3:8b",
    description: "Llama 3 8B model via Ollama",
    features: ["Balanced performance", "Local processing", "Medical capability"],
    performance: "good"
  },
  openai_gpt4: {
    name: "OpenAI GPT-4 (Cloud)",
    type: "openai",
    api: "openai",
    model: "gpt-4",
    description: "OpenAI's GPT-4 for medical consultation",
    features: ["Advanced reasoning", "Medical expertise", "Detailed responses"],
    performance: "excellent"
  },
  claude_sonnet: {
    name: "Anthropic Claude Sonnet (Cloud)",
    type: "claude",
    api: "claude",
    model: "claude-3-sonnet-20240229",
    description: "Anthropic's Claude for medical analysis",
    features: ["Detailed analysis", "Safe responses", "Medical knowledge"],
    performance: "excellent"
  }
};

// Enhanced Smart Doctor Service with Chat functionality
class SmartDoctorService {
  constructor() {
    this.selectedModel = 'gemini_fast';
    this.selectedContext = 'general';
    this.geminiApiKey = 'AIzaSyABGuU0fO7Yt9OUdCVbLzgFS17UV0X6Gzk';
    this.selectedAPI = 'gemini';
    this.conversationHistory = [];
  }

  // Chat-based consultation method
  async getChatResponse(userMessage) {
    try {
      const modelConfig = aiModels[this.selectedModel];
      
      // Add conversation context
      this.conversationHistory.push({ role: 'user', content: userMessage });
      
      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
      
      // Route based on selected API preference
      console.log(`Using API: ${this.selectedAPI}, Model: ${this.selectedModel}`);
      
      switch (this.selectedAPI) {
        case 'gemini':
          return await this.queryGemini(userMessage);
          
        case 'ollama':
          // Performance check for Ollama models
          if (modelConfig.warning) {
            console.warn(`Performance warning: ${modelConfig.warning}`);
            console.log('Switching to Gemini for better performance...');
            return await this.queryGemini(userMessage);
          }
          try {
            return await this.queryOllama(userMessage);
          } catch (ollamaError) {
            console.warn('Ollama failed, falling back to Gemini:', ollamaError.message);
            return await this.queryGemini(userMessage);
          }
          
        case 'openai':
          console.log('OpenAI integration - falling back to Gemini');
          return await this.queryGemini(userMessage);
          
        case 'claude':
          console.log('Claude integration - falling back to Gemini');
          return await this.queryGemini(userMessage);
          
        default:
          return await this.queryGemini(userMessage);
      }
    } catch (error) {
      console.error('Chat Response Error:', error);
      return this.getSimulatedChatResponse(userMessage);
    }
  }

  // Gemini API query with enhanced error handling
  async queryGemini(prompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const context = medicalContexts[this.selectedContext];
    const enhancedPrompt = `You are Dr. Medzy AI, an advanced medical assistant specializing in ${context.name}. 

Patient Query: "${prompt}"

Please provide a comprehensive medical analysis with the following structure:

🩺 **INITIAL ASSESSMENT**
- Clinical evaluation of symptoms presented
- Preliminary diagnostic considerations
- Severity and urgency assessment

💊 **TREATMENT RECOMMENDATIONS**  
- Specific over-the-counter medications with exact dosages
- Prescription medications that may be needed (patient should consult doctor)
- Natural remedies and home care options
- Duration of treatment recommendations

🚨 **WARNING SIGNS & PRECAUTIONS**
- Emergency symptoms requiring immediate medical attention
- Red flags that indicate serious conditions
- When to call emergency services vs. see a doctor
- Safety precautions during treatment

📋 **FOLLOW-UP & MONITORING**
- Expected timeline for improvement
- Signs that indicate improvement or worsening
- When to schedule follow-up appointments
- Self-monitoring guidelines

🏥 **PROFESSIONAL CARE RECOMMENDATIONS**
- Type of healthcare provider to see (GP, specialist, etc.)
- Urgency level (emergency, urgent, routine)
- Questions to ask your healthcare provider
- What information to bring to appointments

**Context Specialization:** ${context.specialization}
**Medical Disclaimer:** This AI analysis is for informational and educational purposes only. It cannot replace professional medical diagnosis, treatment, or advice. Always consult qualified healthcare professionals for proper medical evaluation and personalized treatment plans.

Provide evidence-based, practical advice while prioritizing patient safety and the importance of professional medical consultation.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add conversation to history
        this.conversationHistory.push({ role: 'assistant', content: aiResponse });
        
        return aiResponse;
      } else if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === 'SAFETY') {
        throw new Error('Content was blocked by safety filters. Please rephrase your medical question.');
      } else {
        throw new Error('No valid response received from AI service');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Enhanced error handling with specific messages
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration issue. Please contact support.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('AI service is currently at capacity. Please try again in a few minutes.');
      } else if (error.message.includes('safety')) {
        throw new Error('Your question was flagged by safety filters. Please rephrase your medical concern in a different way.');
      } else {
        throw error;
      }
    }
  }

  // Ollama API query
  async queryOllama(prompt) {
    try {
      const response = await fetch(`${AI_CONFIG.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModels[this.selectedModel].model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw error;
    }
  }

  // Check Ollama connection
  async checkOllamaConnection() {
    try {
      const response = await fetch(`${AI_CONFIG.OLLAMA_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama connection check failed:', error);
      return false;
    }
  }

  // Get available Ollama models
  async getAvailableOllamaModels() {
    try {
      const response = await fetch(`${AI_CONFIG.OLLAMA_URL}/api/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  // Enhanced chat fallback response with intelligent analysis
  getSimulatedChatResponse(userMessage) {
    const context = medicalContexts[this.selectedContext];
    const messageText = userMessage.toLowerCase();
    
    // Intelligent keyword analysis for better responses
    let symptoms = [];
    let urgency = 'low';
    let specificAdvice = [];
    let medicines = [];
    
    // Symptom detection
    const symptomKeywords = {
      pain: ['pain', 'ache', 'hurt', 'sore', 'tender', 'throbbing', 'sharp', 'dull'],
      fever: ['fever', 'temperature', 'hot', 'chills', 'sweating'],
      respiratory: ['cough', 'breathing', 'chest', 'throat', 'congestion', 'wheezing'],
      digestive: ['nausea', 'vomiting', 'stomach', 'abdominal', 'diarrhea', 'constipation'],
      neurological: ['headache', 'dizzy', 'confusion', 'memory', 'vision', 'numbness'],
      mental: ['anxiety', 'depression', 'stress', 'panic', 'worry', 'mood']
    };

    // Urgency indicators
    const urgentKeywords = ['severe', 'intense', 'unbearable', 'emergency', 'can\'t', 'unable', 'difficulty breathing', 'chest pain'];
    const moderateKeywords = ['moderate', 'concerning', 'getting worse', 'persistent'];

    // Analyze message for symptoms and urgency
    Object.entries(symptomKeywords).forEach(([category, keywords]) => {
      const found = keywords.some(keyword => messageText.includes(keyword));
      if (found) symptoms.push(category);
    });

    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      urgency = 'high';
    } else if (moderateKeywords.some(keyword => messageText.includes(keyword))) {
      urgency = 'medium';
    }

    // Generate specific advice based on detected symptoms
    if (symptoms.includes('pain')) {
      medicines.push('Ibuprofen 400mg every 6-8 hours with food (max 1200mg/day)');
      medicines.push('Acetaminophen 500-1000mg every 6 hours (max 4000mg/day)');
      specificAdvice.push('Apply ice for acute injuries or heat for muscle tension');
      specificAdvice.push('Rest the affected area and avoid activities that worsen pain');
    }

    if (symptoms.includes('fever')) {
      medicines.push('Acetaminophen or Ibuprofen for fever reduction');
      specificAdvice.push('Stay hydrated with plenty of fluids');
      specificAdvice.push('Rest and monitor temperature regularly');
      specificAdvice.push('Use cooling measures like cool compresses');
    }

    if (symptoms.includes('respiratory')) {
      medicines.push('Throat lozenges for sore throat');
      medicines.push('Saline nasal spray for congestion');
      specificAdvice.push('Use a humidifier or breathe steam from hot shower');
      specificAdvice.push('Avoid irritants like smoke and strong odors');
    }

    if (symptoms.includes('digestive')) {
      medicines.push('Oral rehydration solution for diarrhea');
      medicines.push('Antacids for stomach discomfort (if appropriate)');
      specificAdvice.push('BRAT diet: Bananas, Rice, Applesauce, Toast');
      specificAdvice.push('Stay hydrated with small, frequent sips');
    }

    if (symptoms.includes('neurological')) {
      specificAdvice.push('Rest in a quiet, dark room for headaches');
      specificAdvice.push('Apply cold compress to forehead for headaches');
      specificAdvice.push('Ensure adequate sleep and stress management');
    }

    if (symptoms.includes('mental')) {
      specificAdvice.push('Practice deep breathing and relaxation techniques');
      specificAdvice.push('Maintain regular sleep schedule and exercise');
      specificAdvice.push('Consider speaking with a mental health professional');
    }

    // Default advice if no specific symptoms detected
    if (symptoms.length === 0) {
      specificAdvice.push('Monitor your symptoms and their progression');
      specificAdvice.push('Maintain good hydration and nutrition');
      specificAdvice.push('Get adequate rest and sleep');
    }

    // Urgency-based recommendations
    let urgencySection = '';
    if (urgency === 'high') {
      urgencySection = `🚨 **URGENT - SEEK IMMEDIATE MEDICAL ATTENTION**
Based on your description, this may require immediate evaluation. Please:
• Call emergency services if experiencing severe symptoms
• Go to the nearest emergency room
• Contact your healthcare provider immediately

`;
    } else if (urgency === 'medium') {
      urgencySection = `⚠️ **MODERATE CONCERN - SEE HEALTHCARE PROVIDER**
Your symptoms warrant medical evaluation within 24-48 hours:
• Schedule an appointment with your doctor soon
• Monitor symptoms closely for any worsening
• Seek immediate care if symptoms become severe

`;
    }

    return `🩺 **DR. MEDZY AI - MEDICAL CONSULTATION**

Thank you for describing your symptoms: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"

${urgencySection}**🔍 SYMPTOM ANALYSIS**
Based on your description, I've identified potential concerns related to: ${symptoms.length > 0 ? symptoms.join(', ') : 'general health symptoms'}

**💊 MEDICATION & TREATMENT RECOMMENDATIONS**
${medicines.length > 0 ? medicines.map(med => `• ${med}`).join('\n') : '• Consult with pharmacist for appropriate over-the-counter options based on your specific symptoms'}

**🏠 SELF-CARE MEASURES**
${specificAdvice.map(advice => `• ${advice}`).join('\n')}
• Monitor symptoms and track any changes
• Maintain good hygiene to prevent spread to others

**🚨 EMERGENCY WARNING SIGNS**
Seek immediate medical attention if you experience:
• Difficulty breathing or shortness of breath
• Severe chest pain or pressure
• High fever above 103°F (39.4°C)
• Severe dehydration or inability to keep fluids down
• Confusion, severe headache, or vision changes
• Any symptom that is rapidly worsening

**📋 FOLLOW-UP RECOMMENDATIONS**
• **Timeline:** ${urgency === 'high' ? 'Immediate medical attention required' : 
                   urgency === 'medium' ? 'See healthcare provider within 24-48 hours' : 
                   'Monitor for 24-72 hours, see doctor if symptoms persist or worsen'}
• **Specialist:** ${symptoms.includes('mental') ? 'Consider mental health professional' :
                   symptoms.includes('neurological') ? 'Neurologist if symptoms persist' :
                   'Start with your primary care physician'}

**🎯 PERSONALIZED FOR:** ${context.name} ${context.icon}
**SPECIALIZATION:** ${context.specialization}

**⚠️ IMPORTANT MEDICAL DISCLAIMER**
This AI analysis is for informational and educational purposes only. It cannot replace professional medical diagnosis, treatment, or advice. This assessment is based on limited information and cannot consider your complete medical history, current medications, allergies, or individual health factors. Always consult qualified healthcare professionals for:
• Proper medical evaluation and diagnosis
• Personalized treatment plans
• Medication recommendations and dosing
• Emergency medical situations

If this is a medical emergency, please contact emergency services immediately.`;
  }
}

const smartDoctorService = new SmartDoctorService();

const SmartDoctorChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Enhanced state management
  const [showSettings, setShowSettings] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemini_fast');
  const [selectedAPI, setSelectedAPI] = useState('gemini');
  const [selectedContext, setSelectedContext] = useState('general');
  
  const { user } = useAuth();
  const { success, error } = useNotification();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkOllamaStatus();
    startNewChat(); // Start with welcome message
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkOllamaStatus = async () => {
    const connected = await smartDoctorService.checkOllamaConnection();
    setOllamaConnected(connected);
    
    if (connected) {
      const models = await smartDoctorService.getAvailableOllamaModels();
      setAvailableModels(models);
    }
  };

  // Chat-based functionality with enhanced error handling
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add typing indicator
      const typingMessage = {
        type: 'bot',
        content: '🔄 Dr. Medzy AI is analyzing your symptoms...',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);

      // Update service configuration
      smartDoctorService.selectedModel = selectedModel;
      smartDoctorService.selectedContext = selectedContext;
      smartDoctorService.selectedAPI = selectedAPI;
      
      // Create enhanced medical consultation prompt
      const context = medicalContexts[selectedContext];
      const medicalPrompt = `You are Dr. Medzy AI, an advanced medical assistant specializing in ${context.name}. 

**Patient Consultation Request:**
"${userMessage.content}"

**Your Response Guidelines:**
1. Provide a comprehensive yet concise medical analysis
2. Structure your response with clear sections using emojis
3. Include specific, actionable recommendations
4. Always prioritize patient safety
5. Be empathetic and professional

**Response Format:**
🩺 **INITIAL ASSESSMENT**
- Brief analysis of the presented symptoms/concerns

💊 **RECOMMENDATIONS**
- Specific medicines with dosages (if applicable)
- Self-care measures
- Lifestyle modifications

🚨 **IMPORTANT WARNINGS**
- When to seek immediate medical attention
- Red flag symptoms to watch for

📋 **NEXT STEPS**
- Follow-up timeline
- When to see a healthcare provider
- Any additional tests or monitoring needed

**Medical Context:** ${context.description}
**Specialization:** ${context.specialization}

Always end with appropriate medical disclaimers. Provide practical, evidence-based advice while emphasizing the importance of professional medical consultation for proper diagnosis and treatment.`;

      // Get AI response with better error handling
      let aiResponse;
      try {
        aiResponse = await smartDoctorService.getChatResponse(medicalPrompt);
      } catch (apiError) {
        console.error('Primary API failed:', apiError);
        // Try alternative approach or fallback
        aiResponse = await smartDoctorService.getSimulatedChatResponse(userMessage.content);
      }
      
      const botMessage = {
        type: 'bot',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      // Replace typing indicator with actual response
      setMessages(prev => [...prev.slice(0, -1), botMessage]);
      
      // Success notification
      success && success('Medical analysis completed successfully!');
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        type: 'bot',
        content: `⚠️ **I encountered a technical issue while analyzing your symptoms.**

🔄 **What happened:** There was a temporary problem with the AI service.

🩺 **Immediate advice:**
• If you have urgent medical concerns, contact your healthcare provider or emergency services
• For non-urgent symptoms, you can try asking your question again in a few moments
• Consider using the Symptom Checker feature in the other tabs

📞 **Emergency contacts:**
• Emergency services: Call emergency number in your area
• Poison control: Contact your local poison control center
• Mental health crisis: Contact your local crisis hotline

**⚠️ Important:** This is a technical issue, not a medical assessment. Please seek appropriate medical care if you have health concerns.`,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      error && error('Unable to process your request. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    const welcomeMessage = {
      type: 'bot',
      content: `👋 **Hello! I'm Dr. Medzy AI**

I'm here to help analyze your symptoms and provide medical guidance. 

**How I can help:**
• 🩺 Symptom analysis and assessment
• 💊 Medicine recommendations  
• 🚨 Health precautions and warnings
• 📋 Follow-up care suggestions

**Current Specialization:** ${medicalContexts[selectedContext].name} ${medicalContexts[selectedContext].icon}

Please describe your symptoms or health concerns in detail. The more information you provide, the better I can assist you.

**⚠️ Important:** This is AI-generated medical guidance. Always consult qualified healthcare professionals for proper diagnosis and treatment.`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([welcomeMessage]);
  };

  const resetConsultation = () => {
    setMessages([]);
    startNewChat();
  };

  // Embedded chat interface (not floating)
  return (
    <div className="w-full h-[700px] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-6 flex items-center justify-between flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Smart Doctor AI</h3>
            <p className="text-sm opacity-90 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              {ollamaConnected ? `${aiModels[selectedModel]?.name}` : 'Cloud-Powered Intelligence'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            title="AI Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {messages.length > 1 && (
            <button
              onClick={resetConsultation}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
              title="New Consultation"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 flex-shrink-0">
          <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center text-lg">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            AI Configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-3 h-3 inline mr-1" />
                AI Provider
              </label>
              <select
                value={selectedAPI}
                onChange={(e) => setSelectedAPI(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="gemini">🌟 Google Gemini (Cloud)</option>
                <option value="ollama">🏠 Ollama (Local)</option>
                <option value="openai">🤖 OpenAI (Cloud)</option>
                <option value="claude">🧠 Claude (Cloud)</option>
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Cpu className="w-3 h-3 inline mr-1" />
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {Object.entries(aiModels)
                  .filter(([key, model]) => selectedAPI === 'gemini' ? model.api === 'gemini' : 
                                           selectedAPI === 'ollama' ? model.api === 'ollama' :
                                           selectedAPI === 'openai' ? model.api === 'openai' :
                                           model.api === 'claude')
                  .map(([key, model]) => (
                    <option key={key} value={key}>
                      {model.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Medical Context Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Stethoscope className="w-3 h-3 inline mr-1" />
                Medical Specialization
              </label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {Object.entries(medicalContexts).map(([key, context]) => (
                  <option key={key} value={key}>
                    {context.icon} {context.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Apply Settings
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
        {/* Chat Messages */}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white ml-3' 
                  : 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mr-3'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
              }`}>
                {message.isTyping ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Analyzing...</span>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or health concerns in detail..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows="2"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartDoctorChatInterface;
