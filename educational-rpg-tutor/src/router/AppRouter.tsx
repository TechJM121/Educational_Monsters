import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleProtectedRoute } from '../components/navigation/SimpleProtectedRoute';
import { AppLayout } from '../components/navigation/AppLayout';

// Import all pages
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { LearningPage } from '../pages/LearningPage';
import { CharacterPage } from '../pages/CharacterPage';
import { QuestsPage } from '../pages/QuestsPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { ParentDashboardPage } from '../pages/ParentDashboardPage';
import { GameModesPage } from '../pages/GameModesPage';
import { AITutorPage } from '../pages/AITutorPage';
import { LandingPage } from '../components/landing/LandingPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page (public, no navigation) */}
        <Route path="/" element={
          <SimpleProtectedRoute requiresAuth={false}>
            <LandingPage />
          </SimpleProtectedRoute>
        } />

        {/* Auth page (public, no navigation) */}
        <Route path="/auth" element={
          <SimpleProtectedRoute requiresAuth={false}>
            <AuthPage />
          </SimpleProtectedRoute>
        } />

        {/* Protected routes (with navigation) */}
        <Route path="/app" element={<AppLayout />}>
          {/* Redirect app root to home */}
          <Route index element={<Navigate to="/app/home" replace />} />

          {/* Main dashboard pages */}
          <Route path="home" element={
            <SimpleProtectedRoute>
              <HomePage />
            </SimpleProtectedRoute>
          } />

          <Route path="learning" element={
            <SimpleProtectedRoute>
              <LearningPage />
            </SimpleProtectedRoute>
          } />

          <Route path="character" element={
            <SimpleProtectedRoute>
              <CharacterPage />
            </SimpleProtectedRoute>
          } />

          <Route path="quests" element={
            <SimpleProtectedRoute>
              <QuestsPage />
            </SimpleProtectedRoute>
          } />

          <Route path="achievements" element={
            <SimpleProtectedRoute>
              <AchievementsPage />
            </SimpleProtectedRoute>
          } />

          <Route path="inventory" element={
            <SimpleProtectedRoute>
              <InventoryPage />
            </SimpleProtectedRoute>
          } />

          <Route path="leaderboard" element={
            <SimpleProtectedRoute>
              <LeaderboardPage />
            </SimpleProtectedRoute>
          } />

          <Route path="parent-dashboard" element={
            <SimpleProtectedRoute>
              <ParentDashboardPage />
            </SimpleProtectedRoute>
          } />

          <Route path="game-modes" element={
            <SimpleProtectedRoute>
              <GameModesPage />
            </SimpleProtectedRoute>
          } />

          <Route path="ai-tutor" element={
            <SimpleProtectedRoute>
              <AITutorPage />
            </SimpleProtectedRoute>
          } />
        </Route>

        {/* 404 page */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-xl mb-8">The page you're looking for doesn't exist.</p>
              <a 
                href="/" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};