import { useState, useEffect } from 'react';
import type { StreakStateDto } from '@streak-os/core';
import { streakService } from './services/streakService';
import './App.css';

function App() {
  const [habitId, setHabitId] = useState<string | null>(null);
  const [streakState, setStreakState] = useState<StreakStateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize demo habit and streak on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Create a demo habit
        const habit = await streakService.createHabit(
          'Daily Coding',
          'Write code every day'
        );
        
        // Create a streak for this habit
        await streakService.createStreak(habit.id);
        
        setHabitId(habit.id);
        
        // Load initial streak state
        const state = await streakService.getStreakState(habit.id);
        setStreakState(state);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const completeToday = async () => {
    if (!habitId) return;
    
    try {
      setLoading(true);
      await streakService.completeHabitToday(habitId);
      const state = await streakService.getStreakState(habitId);
      setStreakState(state);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete');
      setLoading(false);
    }
  };

  const resetStreak = async () => {
    if (!habitId) return;
    
    try {
      setLoading(true);
      await streakService.resetStreak(habitId);
      const state = await streakService.getStreakState(habitId);
      setStreakState(state);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
      setLoading(false);
    }
  };

  if (loading && !streakState) {
    return (
      <div className="app">
        <h1>STREAK-OS</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !streakState) {
    return (
      <div className="app">
        <h1>STREAK-OS</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🔥 STREAK-OS</h1>
      
      {streakState && (
        <div className="streak-card">
          <h2>{streakState.habitName}</h2>
          
          <div className="streak-display">
            <div className="streak-number">
              {streakState.currentStreak}
            </div>
            <div className="streak-label">DAY STREAK</div>
          </div>

          <div className="streak-info">
            <div className="info-row">
              <span>Status:</span>
              <span className={`status-badge status-${streakState.status}`}>
                {streakState.status.toUpperCase()}
              </span>
            </div>
            
            <div className="info-row">
              <span>Longest streak:</span>
              <span>{streakState.longestStreak} days</span>
            </div>
            
            <div className="info-row">
              <span>Total completions:</span>
              <span>{streakState.totalCompletions}</span>
            </div>
            
            <div className="info-row">
              <span>Last completed:</span>
              <span>{streakState.lastCompletionDate ?? 'Never'}</span>
            </div>
          </div>

          <div className="actions">
            <button 
              onClick={completeToday} 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Processing...' : 'Complete Today ✓'}
            </button>
            
            <button 
              onClick={resetStreak} 
              disabled={loading}
              className="btn-secondary"
            >
              Reset Streak
            </button>
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>
      )}

      <footer style={{ marginTop: '2rem', opacity: 0.6, fontSize: '0.9rem' }}>
        <p>Streak Core Engine Demo</p>
        <p>MVP • Clean Architecture • Domain-Driven Design</p>
      </footer>
    </div>
  );
}

export default App;
