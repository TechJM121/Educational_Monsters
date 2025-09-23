// AI Tutor Service for Educational RPG
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  subject?: string;
  userAge?: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  subject?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class AITutorService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private getSystemPrompt(userAge: number, subject?: string): string {
    const ageGroup = userAge <= 8 ? 'young child' : userAge <= 12 ? 'elementary student' : userAge <= 16 ? 'middle school student' : 'high school student';
    
    return `You are a friendly, encouraging AI tutor helping a ${ageGroup} (age ${userAge}). 
    ${subject ? `Focus on ${subject} topics when relevant.` : 'You can help with any educational topic.'}
    
    Guidelines:
    - Use age-appropriate language and examples
    - Be encouraging and positive
    - Break down complex concepts into simple steps
    - Use emojis and fun examples to keep engagement high
    - Ask follow-up questions to check understanding
    - Provide practical examples and real-world connections
    - Keep responses concise but thorough
    - If the student seems frustrated, offer encouragement and simpler explanations
    
    Remember: You're not just answering questions, you're helping them learn and grow!`;
  }

  async sendMessage(
    messages: ChatMessage[], 
    userAge: number, 
    subject?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set your API key in settings.');
    }

    try {
      const systemMessage = {
        role: 'system' as const,
        content: this.getSystemPrompt(userAge, subject)
      };

      const apiMessages = [
        systemMessage,
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I had trouble generating a response. Please try again!';
    } catch (error) {
      console.error('AI Tutor Service Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get response from AI tutor. Please check your connection and try again.');
    }
  }

  saveChatSession(session: ChatSession): void {
    try {
      const sessions = this.getChatSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      const recentSessions = sessions.slice(-10);
      localStorage.setItem('ai_tutor_sessions', JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  }

  getChatSessions(): ChatSession[] {
    try {
      const sessions = localStorage.getItem('ai_tutor_sessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  createChatSession(userId: string, subject?: string): ChatSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      subject,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  getSuggestedQuestions(userAge: number, subject?: string): string[] {
    const baseQuestions = [
      "Can you help me understand this topic better?",
      "What's a fun way to remember this?",
      "Can you give me an example?",
      "How does this work in real life?",
      "What should I study next?"
    ];

    if (!subject) return baseQuestions;

    const subjectQuestions: Record<string, string[]> = {
      mathematics: [
        "How can I get better at solving math problems?",
        "What's a trick to remember multiplication tables?",
        "Can you explain fractions with pizza slices?",
        "How is math used in video games?",
        "What's the easiest way to do long division?"
      ],
      science: [
        "Why do things fall down instead of up?",
        "How do plants make their own food?",
        "What makes the sky blue?",
        "How do magnets work?",
        "Why do we need to breathe oxygen?"
      ],
      'language-arts': [
        "How can I write better stories?",
        "What makes a good book character?",
        "How do I remember spelling rules?",
        "What's the difference between fiction and non-fiction?",
        "How can I improve my reading speed?"
      ],
      history: [
        "What was life like for kids in ancient times?",
        "How did people communicate before phones?",
        "Why did people build castles?",
        "What were the most important inventions?",
        "How do we know about things that happened long ago?"
      ],
      art: [
        "What colors make other colors?",
        "How do artists make things look 3D on paper?",
        "What's the difference between different art styles?",
        "How can I get better at drawing?",
        "What makes a painting famous?"
      ]
    };

    return subjectQuestions[subject] || baseQuestions;
  }
}

export const aiTutorService = new AITutorService();