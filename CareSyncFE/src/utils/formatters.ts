// Formatting utilities for dates, times, etc.

import { format, parseISO } from 'date-fns';

export const formatters = {
  // Format date: "2026-02-04" → "Feb 4, 2026"
  date: (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  },

  // Format datetime: "2026-02-04T08:00:00" → "Feb 4, 2026 8:00 AM"
  datetime: (datetimeString: string): string => {
    try {
      return format(parseISO(datetimeString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return datetimeString;
    }
  },

  // Format time: "2026-02-04T08:00:00" → "8:00 AM"
  time: (datetimeString: string): string => {
    try {
      return format(parseISO(datetimeString), 'h:mm a');
    } catch (error) {
      return datetimeString;
    }
  },

  // Format phone: "+9779801234567" → "+977-980-123-4567"
  phone: (phoneNumber: string): string => {
    // Simple formatting, adjust based on your needs
    return phoneNumber.replace(/(\+\d{3})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4');
  },

  // Format percentage: 0.95 → "95%"
  percentage: (value: number): string => {
    return `${Math.round(value)}%`;
  },

  // Truncate text: "Long text..." → "Long te..."
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
};