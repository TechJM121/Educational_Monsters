import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

export type LoadingType = 'data' | 'images' | 'forms' | 'navigation' | 'content' | 'custom';

export interface LoadingState {
  id: string;
  type: LoadingType;
  message?: string;
  progress?: number;
  startTime: number;
  metadata?: Record<string, any>;
}

interface LoadingContextState {
  loadingStates: Record<string, LoadingState>;
  globalLoading: boolean;
  loadingCount: number;
}

type LoadingAction =
  | { type: 'START_LOADING'; payload: LoadingState }
  | { type: 'STOP_LOADING'; payload: { id: string } }
  | { type: 'UPDATE_LOADING'; payload: { id: string; progress?: number; message?: string } }
  | { type: 'CLEAR_ALL' };

interface LoadingContextValue extends LoadingContextState {
  startLoading: (id: string, type: LoadingType, message?: string, metadata?: Record<string, any>) => void;
  stopLoading: (id: string) => void;
  updateLoading: (id: string, progress?: number, message?: string) => void;
  clearAllLoading: () => void;
  isLoading: (id?: string) => boolean;
  getLoadingState: (id: string) => LoadingState | undefined;
  getLoadingsByType: (type: LoadingType) => LoadingState[];
}

const initialState: LoadingContextState = {
  loadingStates: {},
  globalLoading: false,
  loadingCount: 0
};

const loadingReducer = (state: LoadingContextState, action: LoadingAction): LoadingContextState => {
  switch (action.type) {
    case 'START_LOADING': {
      const newLoadingStates = {
        ...state.loadingStates,
        [action.payload.id]: action.payload
      };
      
      return {
        ...state,
        loadingStates: newLoadingStates,
        loadingCount: Object.keys(newLoadingStates).length,
        globalLoading: Object.keys(newLoadingStates).length > 0
      };
    }
    
    case 'STOP_LOADING': {
      const { [action.payload.id]: removed, ...remainingStates } = state.loadingStates;
      
      return {
        ...state,
        loadingStates: remainingStates,
        loadingCount: Object.keys(remainingStates).length,
        globalLoading: Object.keys(remainingStates).length > 0
      };
    }
    
    case 'UPDATE_LOADING': {
      const existingState = state.loadingStates[action.payload.id];
      if (!existingState) return state;
      
      const updatedState = {
        ...existingState,
        ...(action.payload.progress !== undefined && { progress: action.payload.progress }),
        ...(action.payload.message !== undefined && { message: action.payload.message })
      };
      
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.id]: updatedState
        }
      };
    }
    
    case 'CLEAR_ALL':
      return initialState;
    
    default:
      return state;
  }
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const startLoading = useCallback((
    id: string, 
    type: LoadingType, 
    message?: string, 
    metadata?: Record<string, any>
  ) => {
    dispatch({
      type: 'START_LOADING',
      payload: {
        id,
        type,
        message,
        startTime: Date.now(),
        metadata
      }
    });
  }, []);

  const stopLoading = useCallback((id: string) => {
    dispatch({
      type: 'STOP_LOADING',
      payload: { id }
    });
  }, []);

  const updateLoading = useCallback((id: string, progress?: number, message?: string) => {
    dispatch({
      type: 'UPDATE_LOADING',
      payload: { id, progress, message }
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const isLoading = useCallback((id?: string) => {
    if (id) {
      return id in state.loadingStates;
    }
    return state.globalLoading;
  }, [state.loadingStates, state.globalLoading]);

  const getLoadingState = useCallback((id: string) => {
    return state.loadingStates[id];
  }, [state.loadingStates]);

  const getLoadingsByType = useCallback((type: LoadingType) => {
    return Object.values(state.loadingStates).filter(loading => loading.type === type);
  }, [state.loadingStates]);

  const value: LoadingContextValue = {
    ...state,
    startLoading,
    stopLoading,
    updateLoading,
    clearAllLoading,
    isLoading,
    getLoadingState,
    getLoadingsByType
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};