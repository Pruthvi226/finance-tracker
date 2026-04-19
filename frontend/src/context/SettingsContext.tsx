import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { isAuthenticated } from '../services/auth';

interface UserSettings {
  theme: 'light' | 'dark';
  currency: string;
  notificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  language: string;
  timezone: string;
}

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean, data: UserSettings }>('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;
    try {
      const merged = { ...settings, ...newSettings };
      const res = await api.put<{ success: boolean, data: UserSettings }>('/settings', merged);
      if (res.data.success) {
        setSettings(res.data.data);
        toast.success('Settings synchronized globally');
      }
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'USD';
    const language = settings?.language || 'en-US';
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
