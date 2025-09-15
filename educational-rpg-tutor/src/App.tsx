import { useState } from 'react'
import { useSupabase } from './hooks/useSupabase'
import { useCharacter } from './hooks/useCharacter'
import { useHomePageData } from './hooks/useHomePageData'
import { RPGHomePage } from './components/home/RPGHomePage'
import { AuthManager } from './components/auth/AuthManager'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { user, loading: authLoading } = useSupabase()
  const { character, loading: characterLoading } = useCharacter(user?.id || null)
  const { 
    achievements, 
    userAchievements, 
    quests, 
    inventory, 
    learningStreak,
    loading: dataLoading 
  } = useHomePageData(user?.id || null)

  const loading = authLoading || characterLoading || dataLoading

  // Handle authentication completion
  const handleAuthComplete = () => {
    setIsAuthenticated(true)
  }

  // Show loading while checking auth state
  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-xl font-rpg">Loading Educational RPG Tutor...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated and has completed onboarding, show the RPG home page
  if (user && character && isAuthenticated) {
    return (
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
    )
  }

  // Show authentication and onboarding flow
  return <AuthManager onAuthComplete={handleAuthComplete} />
}

export default App
