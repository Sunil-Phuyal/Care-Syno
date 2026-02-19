// src/hooks/useTheme.ts

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Main hook — use this anywhere you need theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

// Helper — returns true if dark mode is on
export function useIsDarkMode(): boolean {
  const { theme } = useTheme();
  return theme === 'dark';
}