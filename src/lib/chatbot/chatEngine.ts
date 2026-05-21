// Chatbot Engine - Pattern matching and response generation
// No external API dependencies - fully local processing

import { knowledgeBase, quickResponses, KnowledgeEntry, siteInfo } from './knowledgeBase';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  matchedCategory?: string;
  confidence: number;
}

// Generate unique ID for messages
export const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Normalize text for better matching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

// Calculate similarity score between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const words1 = new Set(normalizeText(str1).split(' '));
  const words2 = new Set(normalizeText(str2).split(' '));
  
  let intersection = 0;
  words1.forEach(word => {
    if (words2.has(word)) intersection++;
  });
  
  const union = words1.size + words2.size - intersection;
  return union > 0 ? intersection / union : 0;
};

// Find best matching knowledge entry
const findBestMatch = (userInput: string): { entry: KnowledgeEntry; confidence: number } => {
  const normalized = normalizeText(userInput);
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;

    // Check pattern matches (highest priority)
    for (const pattern of entry.patterns) {
      if (pattern.test(userInput)) {
        score = Math.max(score, 0.9);
        break;
      }
    }

    // Check keyword matches
    const matchedKeywords = entry.keywords.filter(keyword => 
      normalized.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const keywordScore = matchedKeywords.length / entry.keywords.length;
      score = Math.max(score, keywordScore * 0.8);
    }

    // Calculate string similarity for additional context
    const keywordsString = entry.keywords.join(' ');
    const similarity = calculateSimilarity(userInput, keywordsString);
    score = Math.max(score, similarity * 0.6);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Return default response if no good match found
  if (!bestMatch || bestScore < 0.1) {
    const defaultEntry = knowledgeBase[knowledgeBase.length - 1]; // Last entry is default
    return { entry: defaultEntry, confidence: 0 };
  }

  return { entry: bestMatch, confidence: bestScore };
};

// Check for quick responses
const checkQuickResponse = (input: string): string | null => {
  const normalized = normalizeText(input);
  
  for (const [key, response] of Object.entries(quickResponses)) {
    if (normalized === key || normalized.startsWith(key + ' ') || normalized.endsWith(' ' + key)) {
      return response;
    }
  }
  
  return null;
};

// Main function to generate chatbot response
export const generateResponse = (userInput: string): ChatbotResponse => {
  // Handle empty input
  if (!userInput.trim()) {
    return {
      message: "Please type a message or question, and I'll be happy to help!",
      suggestions: ['How to submit a paper?', 'Contact information', 'Submission guidelines'],
      confidence: 1
    };
  }

  // Check for quick responses first
  const quickResponse = checkQuickResponse(userInput);
  if (quickResponse) {
    return {
      message: quickResponse,
      suggestions: ['Learn more', 'Ask another question'],
      confidence: 0.95
    };
  }

  // Find best matching knowledge entry
  const { entry, confidence } = findBestMatch(userInput);

  return {
    message: entry.response,
    suggestions: entry.followUp,
    matchedCategory: entry.category,
    confidence
  };
};

// Get initial greeting message
export const getWelcomeMessage = (): ChatMessage => {
  return {
    id: generateId(),
    content: `👋 Hello! Welcome to **${siteInfo.name}** - ${siteInfo.fullName}!\n\nI'm your virtual assistant. I can help you with:\n\n• 📝 Paper submissions\n• 📋 Submission guidelines\n• 🔍 Review process\n• 📞 Contact information\n• 📚 Browsing archives\n\nHow can I assist you today?`,
    sender: 'bot',
    timestamp: new Date(),
    suggestions: ['Submit a paper', 'Submission guidelines', 'Contact info', 'Check status']
  };
};

// Process user message and return bot response
export const processUserMessage = (userInput: string): ChatMessage => {
  const response = generateResponse(userInput);
  
  return {
    id: generateId(),
    content: response.message,
    sender: 'bot',
    timestamp: new Date(),
    suggestions: response.suggestions
  };
};

// Export types for external use
export type { KnowledgeEntry };
