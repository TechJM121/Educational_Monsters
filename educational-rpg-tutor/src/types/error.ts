// Error handling types
export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'authentication' | 'character' | 'learning' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  timestamp: Date;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface FormValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

export interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastSyncTime?: Date;
  pendingActions: number;
  syncInProgress: boolean;
  retryCount: number;
}

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  category: 'character' | 'learning' | 'quests' | 'social' | 'general';
  keywords: string[];
  relatedTopics: string[];
}

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  category: string;
  title: string;
  description: string;
  rating?: number;
  metadata: {
    page: string;
    userAgent: string;
    timestamp: Date;
    characterLevel?: number;
    sessionDuration?: number;
  };
  status: 'pending' | 'reviewed' | 'resolved';
}