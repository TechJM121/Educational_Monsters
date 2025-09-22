import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/navigation/AppLayout';
import { ProtectedRoute } from '../components/navigation/ProtectedRoute';
import { NotFoundPage } from '../components/navigation/NotFoundPage';

// Page imports
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { LearningPage } from '../pages/LearningPage';
import { CharacterPage } from '../pages/CharacterPage';
import { QuestsPage } from '../pages/QuestsPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { ParentDashboardPage } from '../pages/ParentDashboardPage';
import { LandingPage } from '../components/landing/LandingPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Landing page (public, no navigation) */}
          <Route path="/" element={
            <ProtectedRoute requiresAuth={false}>
              <LandingPage />
            </ProtectedRoute>
          } />

          {/* Auth page (public, no navigation) */}
          <Route path="/auth" element={
            <ProtectedRoute requiresAuth={false}>
              <AuthPage />
            </ProtectedRoute>
          } />

          {/* Protected routes (with navigation) */}
          <Route path="/app" element={<AppLayout />}>
            {/* Redirect app root to home */}
            <Route index element={<Navigate to="/app/home" replace />} />

            {/* Main pages */}
            <Route path="home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />

            <Route path="learning" element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            } />

            <Route path="character" element={
              <ProtectedRoute>
                <CharacterPage />
              </ProtectedRoute>
            } />

            <Route path="quests" element={
              <ProtectedRoute>
                <QuestsPage />
              </ProtectedRoute>
            } />

            <Route path="achievements" element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            } />

            <Route path="inventory" element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            } />

            <Route path="leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />

            <Route path="parent-dashboard" element={
              <ProtectedRoute>
                <ParentDashboardPage />
              </ProtectedRoute>
            } />

            {/* Nested routes for learning worlds */}
            <Route path="learning/worlds" element={
              <ProtectedRoute>
                <div className="min-h-screen p-6">
                  <h1 className="text-4xl font-rpg text-yellow-400">🗺️ All Learning Worlds</h1>
                  <p className="text-slate-300 mt-4">Explore all available learning worlds and adventures.</p>
                </div>
              </ProtectedRoute>
            } />

            <Route path="learning/session" element={
              <ProtectedRoute>
                <div className="min-h-screen p-6">
                  <h1 className="text-4xl font-rpg text-yellow-400">📖 Active Learning Session</h1>
                  <p className="text-slate-300 mt-4">Continue your current learning adventure.</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Nested routes for character */}
            <Route path="character/stats" element={
              <ProtectedRoute>
                <div className="min-h-screen p-6">
                  <h1 className="text-4xl font-rpg text-yellow-400">📊 Stats & Abilities</h1>
                  <p className="text-slate-300 mt-4">View detailed character statistics and abilities.</p>
                </div>
              </ProtectedRoute>
            } />

            <Route path="character/customization" element={
              <ProtectedRoute>
                <div className="min-h-screen p-6">
                  <h1 className="text-4xl font-rpg text-yellow-400">🎨 Character Customization</h1>
                  <p className="text-slate-300 mt-4">Customize your character's appearance and equipment.</p>
                </div>
              </ProtectedRoute>
            } />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};