import React from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useCharacter } from '../hooks/useCharacter';
import { useHomePageData } from '../hooks/useHomePageData';
import { RPGHomePage } from '../components/home/RPGHomePage';
import { HomePageTransition } from '../components/navigation/PageTransition';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { user } = useSupabase();
  const { character, loading: characterLoading } = useCharacter(user?.id || null);
  const { 
    achievements, 
    userAchievements, 
    quests, 
    inventory, 
    learningStreak,
    loading: dataLoading 
  } = useHomePageData(user?.id || null);

  const loading = characterLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your adventure..." />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Character Not Found</h2>
          <p className="text-slate-300">Please create a character to continue your adventure.</p>
        </div>
      </div>
    );
  }

  return (
    <HomePageTransition>
      <RPGHomePage
        character={character}
        achievements={achievements}
        userAchievements={userAchievements}
        quests={quests}
        inventory={inventory}
        learningStreak={learningStreak}
        onStartLearning={() => console.log('Start learning clicked')}
        onViewInventory={() => console.log('View inventory clicked')}
        onViewAchievements={() => console.log('View achievements clicked')}
        onCustomizeCharacter={() => console.log('Customize character clicked')}
        onViewLeaderboard={() => console.log('View leaderboard clicked')}
      />
    </HomePageTransition>
  );
};