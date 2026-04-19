import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';

export type SovereignPersona = 'SAVER' | 'SPENDER' | 'INVESTOR' | 'BALANCED';

interface PersonaDetails {
  type: SovereignPersona;
  color: string;
  glow: string;
  title: string;
  description: string;
}

const PERSONA_MAP: Record<SovereignPersona, PersonaDetails> = {
  SAVER: {
    type: 'SAVER',
    color: '#06b6d4', // Cyan
    glow: 'rgba(6, 182, 212, 0.4)',
    title: 'Smart Saver',
    description: 'You are doing great at saving money. Your spending is very low.'
  },
  SPENDER: {
    type: 'SPENDER',
    color: '#f43f5e', // Rose
    glow: 'rgba(244, 63, 94, 0.4)',
    title: 'Frequent Spender',
    description: 'You are spending quite a bit lately. Let\'s keep an eye on your budget.'
  },
  INVESTOR: {
    type: 'INVESTOR',
    color: '#10b981', // Emerald
    glow: 'rgba(16, 185, 129, 0.4)',
    title: 'Top Investor',
    description: 'You are great at building wealth. Keeping your savings rate high!'
  },
  BALANCED: {
    type: 'BALANCED',
    color: '#6366f1', // Indigo
    glow: 'rgba(99, 102, 241, 0.4)',
    title: 'Balanced Planner',
    description: 'You have a healthy balance between earning and spending.'
  }
};

interface SovereignContextType {
  persona: PersonaDetails;
  score: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SovereignContext = createContext<SovereignContextType | undefined>(undefined);

export const SovereignProvider = ({ children }: { children: ReactNode }) => {
  const [persona, setPersona] = useState<PersonaDetails>(PERSONA_MAP.BALANCED);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const determinePersona = (healthScore: number, savingsRate: number) => {
    if (healthScore > 85 && savingsRate > 40) return PERSONA_MAP.INVESTOR;
    if (healthScore > 70) return PERSONA_MAP.SAVER;
    if (savingsRate < 10) return PERSONA_MAP.SPENDER;
    return PERSONA_MAP.BALANCED;
  };

  const refresh = async () => {
    try {
      const { data } = await api.get('/ai/health-score');
      setScore(data.score || 0);
      
      const analyticsRes = await api.get('/analytics');
      const analyticsData = analyticsRes.data || {};
      const inc = Object.values(analyticsData.monthlyIncome || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
      const exp = Object.values(analyticsData.monthlyExpenses || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
      const rate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;

      setPersona(determinePersona(data?.score || 0, rate));
    } catch (err) {
      console.error("Failed to sync AI Persona");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      refresh();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <SovereignContext.Provider value={{ persona, score, loading, refresh }}>
      {children}
    </SovereignContext.Provider>
  );
};

export const useSovereign = () => {
  const context = useContext(SovereignContext);
  if (!context) throw new Error('useSovereign must be used within SovereignProvider');
  return context;
};
