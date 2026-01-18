
export enum CoffeeMode {
  BRAND = 'BRAND',
  HOME = 'HOME'
}

export enum FreshnessState {
  AGING = 'AGING',
  PEAK = 'PEAK',
  STALE = 'STALE'
}

export type SleepDifficulty = 'Easy' | 'Normal' | 'Hard';

export interface UserProfile {
  name: string;
  avatar: string; // Icon ID or Base64 data
  dailyLimit: number; // mg
  preferredDrink: string;
  weight: number; // kg
  height: number; // cm
  sleepDifficulty: SleepDifficulty;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  textColor: string;
  logo: string;
  bestSellers: { name: string; baseCaffeine: number; basePrice: number }[];
}

export interface CoffeeLog {
  id: string;
  timestamp: number; // ms
  name: string;
  caffeine: number; // mg
  price: number;
  mode: CoffeeMode;
  brandId?: string;
  beanId?: string; // Link to specific inventory
  thoughts?: string;
  details?: {
    size?: 'Small' | 'Medium' | 'Large';
    milk?: 'Whole' | 'Oat' | 'Soy' | 'Coconut' | 'None';
    ice?: 'No Ice' | 'Less Ice' | 'Normal Ice' | 'Extra Ice';
    beanWeight?: number;
  };
}

export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  roastDate: string; // ISO string
  dateOpened?: string; // ISO string
  totalWeight: number; // grams
  currentWeight: number; // grams
  price: number;
  flavorProfile: string[];
  isArchived: boolean;
  hasBeenOpened: boolean;
  imageUrl?: string; // Custom image path or base64
  ratings?: {
    acidity: number;
    bitterness: number;
    sweetness: number;
    aroma: number;
    body: number;
  };
}

export interface UserStats {
  monthlyBudget: number;
  savingsGoal: string;
  goalPrice: number;
  cafeBenchmark?: number; // The user's typical outside coffee cost
}
