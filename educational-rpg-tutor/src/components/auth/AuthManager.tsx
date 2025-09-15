import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SignInForm } from './SignInForm';
import { RegistrationFlow } from './RegistrationFlow';
import { PasswordResetForm } from './PasswordResetForm';
import { CharacterCreationWizard } from './CharacterCreationWizard';
import { WelcomeTutorial } from './WelcomeTutorial';
import { useSupabase } from '../../hooks/useSupabase';
import { useCharacter } from '../../hooks/useCharacter';
import { AuthService } from '../../services/authService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { Character } from '../../types/character';

type AuthView = 'signin' | 'register' | 'reset-password' | 'character-creation' | 'tutorial';

interface AuthManagerProps {
  onAuthComplete: () => void;
}

export const AuthManager: React.FC<AuthManagerProps> = ({ onAuthComplete }) => {
  const [currentView, setCurrentView] = useState<AuthView>('signin');
  const [showTutorial, setShowTutorial] = useState(false);
  const { user, loading: authLoading } = useSupabase();
  const { character, loading: characterLoading } = useCharacter(user?.id || null);

  // Check if user needs parental consent
  const [needsParentalConsent, setNeedsParentalConsent] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(false);

  useEffect(() => {
    const checkParentalConsent = async () => {
      if (user && !character) {
        setCheckingConsent(true);
        try {
          const needsConsent = await AuthService.needsParentalConsent(user.id);
          setNeedsParentalConsent(needsConsent);
        } catch (error) {
          console.error('Error checking parental consent:', error);
        } finally {
          setCheckingConsent(false);
        }
      }
    };

    checkParentalConsent();
  }, [user, character]);

  // Handle authentication state changes
  useEffect(() => {
    if (authLoading || checkingConsent) return;

    if (user) {
      if (needsParentalConsent) {
        // User exists but needs parental consent - show waiting message
        return;
      }

      if (!character && !characterLoading) {
        // User exists but no character - show character creation
        setCurrentView('character-creation');
        return;
      }

      if (character) {
        // Check if this is a new character (should show tutorial)
        const isNewCharacter = character.totalXP === 0 && character.level === 1;
        if (isNewCharacter && !showTutorial) {
          setShowTutorial(true);
          return;
        }

        // User has character and doesn't need tutorial - complete auth
        if (!showTutorial) {
          onAuthComplete();
        }
      }
    }
  }, [user, character, authLoading, characterLoading, needsParentalConsent, checkingConsent, showTutorial, onAuthComplete]);

  const handleSignInSuccess = () => {
    // Auth state change will be handled by useEffect
  };

  const handleRegistrationComplete = () => {
    // Auth state change will be handled by useEffect
  };

  const handleCharacterCreated = (newCharacter: Character) => {
    // Character creation complete, show tutorial
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    onAuthComplete();
  };

  // Show loading while checking auth state
  if (authLoading || characterLoading || checkingConsent) {
    return (
      <div className="min-h-screen bg-rpg-pattern flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-xl font-rpg text-slate-300">
            {authLoading ? 'Checking authentication...' : 
             characterLoading ? 'Loading character...' :
             'Verifying account status...'}
          </p>
        </div>
      </div>
    );
  }

  // Show parental consent waiting message
  if (user && needsParentalConsent) {
    return (
      <div className="min-h-screen bg-rpg-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rpg-card text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-rpg text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-4">
              Awaiting Approval
            </h1>
            <p className="text-slate-300 mb-6">
              Your account is waiting for parental consent. Please ask your parent or guardian 
              to check their email and approve your account.
            </p>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-blue-300 font-semibold mb-2">What's happening?</h3>
              <ul className="text-blue-200 text-sm space-y-1 text-left">
                <li>• We sent a consent request to your parent/guardian</li>
                <li>• They need to click the approval link in their email</li>
                <li>• Once approved, you can create your character</li>
                <li>• Check back here after they've given consent</li>
              </ul>
            </div>
            <button
              onClick={() => {
                AuthService.signOut();
                setCurrentView('signin');
              }}
              className="rpg-button w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show tutorial if character exists and tutorial should be shown
  if (user && character && showTutorial) {
    return (
      <WelcomeTutorial
        character={character}
        onTutorialComplete={handleTutorialComplete}
      />
    );
  }

  // Show character creation if user exists but no character
  if (user && !character && currentView === 'character-creation') {
    return (
      <CharacterCreationWizard
        userId={user.id}
        onCharacterCreated={handleCharacterCreated}
      />
    );
  }

  // Show authentication forms for non-authenticated users
  return (
    <AnimatePresence mode="wait">
      {currentView === 'signin' && (
        <SignInForm
          key="signin"
          onSignInSuccess={handleSignInSuccess}
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('reset-password')}
        />
      )}

      {currentView === 'register' && (
        <RegistrationFlow
          key="register"
          onRegistrationComplete={handleRegistrationComplete}
          onBackToLogin={() => setCurrentView('signin')}
        />
      )}

      {currentView === 'reset-password' && (
        <PasswordResetForm
          key="reset-password"
          onBackToSignIn={() => setCurrentView('signin')}
        />
      )}
    </AnimatePresence>
  );
};