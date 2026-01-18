import React from 'react';
import { Brand } from './types';
import { 
  User, 
  Cat, 
  Dog, 
  Ghost, 
  Smile, 
  Coffee, 
  Zap, 
  Cloud, 
  Moon, 
  Sun,
  Music,
  Heart
} from 'lucide-react';

export const BRANDS: Brand[] = [
  { 
    id: 'luckin', 
    name: 'Luckin', 
    color: '#003DA5', 
    textColor: '#FFFFFF', 
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEUAADX/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD/PUD9x024AAAAEHRSTlMAEBf4v7+/v79/v3+/DwwNAnL3OQAAAHRJREFUeAHt10kSgCAMRNEpIiqI+590pAsYAnFr86uY9yoo0YmI1f8D0BfAtYAnYATwCdgIuAnYCbgJ2AnYCbgJ2Am4CdgJuAnYCbgJuAnYCdgJuAnYCbgJuAnYCVgD8AiYCngEtAIeAa2AR8BXQCvgEfAV0Ao6ALXvAm0fS0G6AAAAAElFTkSuQmCC', 
    bestSellers: [
      { name: 'Americano (标准美式)', baseCaffeine: 150, basePrice: 13 },
      { name: 'Latte (标准拿铁)', baseCaffeine: 130, basePrice: 16 },
      { name: 'Mocha (标准摩卡)', baseCaffeine: 140, basePrice: 18 },
      { name: 'Coconut Latte (生椰拿铁)', baseCaffeine: 140, basePrice: 18 },
      { name: 'Velvet Latte (丝绒拿铁)', baseCaffeine: 130, basePrice: 19 },
      { name: 'Orange Americano (橙C美式)', baseCaffeine: 140, basePrice: 17 }
    ] 
  },
  { 
    id: 'starbucks', 
    name: 'Starbucks', 
    color: '#00704A', 
    textColor: '#FFFFFF', 
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEUAByD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyD/IyDl8290AAAAEHRSTlMAEBf4v7+/v79/v3+/DwwNAnL3OQAAAHRJREFUeAHt10kSgCAMRNEpIiqI+590pAsYAnFr86uY9yoo0YmI1f8D0BfAtYAnYATwCdgIuAnYCbgJ2AnYCbgJ2Am4CdgJuAnYCbgJuAnYCdgJuAnYCbgJuAnYCVgD8AiYCngEtAIeAa2AR8BXQCvgEfAV0Ao6ALXvAm0fS0G6AAAAAElFTkSuQmCC', 
    bestSellers: [
      { name: 'Americano (标准美式)', baseCaffeine: 150, basePrice: 30 },
      { name: 'Latte (标准拿铁)', baseCaffeine: 150, basePrice: 33 },
      { name: 'Mocha (标准摩卡)', baseCaffeine: 175, basePrice: 36 },
      { name: 'Caramel Macchiato (焦糖玛奇朵)', baseCaffeine: 150, basePrice: 38 },
      { name: 'Cold Brew (冷萃冰咖啡)', baseCaffeine: 200, basePrice: 36 },
      { name: 'Flat White (馥芮白)', baseCaffeine: 195, basePrice: 36 }
    ] 
  },
  { 
    id: 'arabica', 
    name: 'Arabica', 
    color: '#1A1A1A', 
    textColor: '#FFFFFF', 
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEUAABf/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyA0Uj9AAAAAEHRSTlMAEBf4v7+/v79/v3+/DwwNAnL3OQAAAHRJREFUeAHt10kSgCAMRNEpIiqI+590pAsYAnFr86uY9yoo0YmI1f8D0BfAtYAnYATwCdgIuAnYCbgJ2AnYCbgJ2Am4CdgJuAnYCbgJuAnYCdgJuAnYCbgJuAnYCVgD8AiYCngEtAIeAa2AR8BXQCvgEfAV0Ao6ALXvAm0fS0G6AAAAAElFTkSuQmCC', 
    bestSellers: [
      { name: 'Americano (标准美式)', baseCaffeine: 160, basePrice: 35 },
      { name: 'Latte (标准拿铁)', baseCaffeine: 160, basePrice: 40 },
      { name: 'Mocha (标准摩卡)', baseCaffeine: 160, basePrice: 45 },
      { name: 'Spanish Latte (西班牙拿铁)', baseCaffeine: 160, basePrice: 45 },
      { name: 'Kyoto Latte (京都拿铁)', baseCaffeine: 160, basePrice: 45 },
      { name: 'Dark Latte (黑拿铁)', baseCaffeine: 170, basePrice: 45 }
    ] 
  },
  { 
    id: 'bluebottle', 
    name: 'Blue Bottle', 
    color: '#00A9E0', 
    textColor: '#FFFFFF', 
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEUAqf//LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyC6pG77AAAAEHRSTlMAEBf4v7+/v79/v3+/DwwNAnL3OQAAAHRJREFUeAHt10kSgCAMRNEpIiqI+590pAsYAnFr86uY9yoo0YmI1f8D0BfAtYAnYATwCdgIuAnYCbgJ2AnYCbgJ2Am4CdgJuAnYCbgJuAnYCdgJuAnYCbgJuAnYCVgD8AiYCngEtAIeAa2AR8BXQCvgEfAV0Ao6ALXvAm0fS0G6AAAAAElFTkSuQmCC', 
    bestSellers: [
      { name: 'Americano (标准美式)', baseCaffeine: 150, basePrice: 38 },
      { name: 'Latte (标准拿铁)', baseCaffeine: 150, basePrice: 42 },
      { name: 'Mocha (标准摩卡)', baseCaffeine: 160, basePrice: 46 },
      { name: 'NOLA Iced (新奥尔良式冷萃)', baseCaffeine: 180, basePrice: 42 },
      { name: 'Gibraltar (直布罗陀)', baseCaffeine: 140, basePrice: 38 },
      { name: 'Hayes Valley Espresso (海耶斯谷)', baseCaffeine: 160, basePrice: 32 }
    ] 
  },
  { 
    id: 'mcdonalds', 
    name: "McDonald's", 
    color: '#FFBC0D', 
    textColor: '#000000', 
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEUA+8D/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyD/LyAm9XzWAAAAEHRSTlMAEBf4v7+/v79/v3+/DwwNAnL3OQAAAHRJREFUeAHt10kSgCAMRNEpIiqI+590pAsYAnFr86uY9yoo0YmI1f8D0BfAtYAnYATwCdgIuAnYCbgJ2AnYCbgJ2Am4CdgJuAnYCbgJuAnYCdgJuAnYCbgJuAnYCVgD8AiYCngEtAIeAa2AR8BXQCvgEfAV0Ao6ALXvAm0fS0G6AAAAAElFTkSuQmCC', 
    bestSellers: [
      { name: 'Americano (标准美式)', baseCaffeine: 140, basePrice: 15 },
      { name: 'Latte (标准拿铁)', baseCaffeine: 140, basePrice: 19 },
      { name: 'Mocha (标准摩卡)', baseCaffeine: 150, basePrice: 20 },
      { name: 'Oat Latte (燕麦拿铁)', baseCaffeine: 130, basePrice: 22 },
      { name: 'Cappuccino (卡布奇诺)', baseCaffeine: 140, basePrice: 19 },
      { name: 'Flat White (澳白)', baseCaffeine: 150, basePrice: 19 }
    ] 
  }
];

export const HOME_PRESETS = [
  { id: 'americano', name: 'Americano', caffeine: 150, extraCost: 0, iconType: 'Droplets', description: 'Espresso & Water', defaultBean: 18, color: '#F0FDFA' },
  { id: 'latte', name: 'Cafe Latte', caffeine: 130, extraCost: 4, iconType: 'Milk', description: 'Espresso & Silky Milk', defaultBean: 18, color: '#F5F3FF' },
  { id: 'flatwhite', name: 'Flat White', caffeine: 150, extraCost: 4, iconType: 'Layers', description: 'Espresso & Microfoam', defaultBean: 18, color: '#FDF2F2' },
  { id: 'dirty', name: 'Dirty Coffee', caffeine: 150, extraCost: 5, iconType: 'Flame', description: 'Hot Espresso over Cold Milk', defaultBean: 20, color: '#FFF7ED' },
  { id: 'handdrip', name: 'Hand Drip', caffeine: 160, extraCost: 0, iconType: 'Wind', description: 'Clean & Floral Notes', defaultBean: 18, color: '#ECFDF5' },
  { id: 'coldbrew', name: 'Cold Brew', caffeine: 200, extraCost: 0, iconType: 'ThermometerSnowflake', description: '12h Slow Steeped', defaultBean: 20, color: '#EFF6FF' }
];

export const DEFAULT_AVATARS = [
  { id: 'user', icon: User, color: '#F5F2ED' },
  { id: 'cat', icon: Cat, color: '#FDF2F2' },
  { id: 'dog', icon: Dog, color: '#F0FDFA' },
  { id: 'ghost', icon: Ghost, color: '#F5F3FF' },
  { id: 'smile', icon: Smile, color: '#FFF7ED' },
  { id: 'coffee', icon: Coffee, color: '#F5F2ED' },
  { id: 'zap', icon: Zap, color: '#FDF2F2' },
  { id: 'music', icon: Music, color: '#F0FDFA' },
  { id: 'heart', icon: Heart, color: '#FFF7ED' },
  { id: 'sun', icon: Sun, color: '#FEF9C3' },
];

export const COFFEE_QUOTES = [
  "Coffee: because adulting is hard.",
  "Good ideas start with great coffee.",
  "Life begins after coffee.",
  "Procaffeinating: The tendency to not start anything until you've had coffee.",
  "Coffee is a language in itself.",
  "Behind every successful person is a substantial amount of coffee."
];

export const CITY_MAPS = {
  shanghai: {
    name: 'Shanghai',
    path: 'M20,50 Q40,10 60,50 T100,50 T140,50 Q160,80 120,100 T80,140 Q40,120 20,80 Z',
  },
  guangzhou: {
    name: 'Guangzhou',
    path: 'M50,20 Q120,10 140,60 T100,100 T40,140 Q10,100 50,60 Z',
  },
  foshan: {
    name: 'Foshan',
    path: 'M30,30 Q80,20 130,50 T120,100 T50,130 Q20,80 30,30 Z',
  }
};

export const ORIGINS = [
  { name: 'Ethiopia', lat: 9.145, lng: 40.4896 },
  { name: 'Brazil', lat: -14.235, lng: -51.9253 },
  { name: 'Yunnan', lat: 25.0406, lng: 102.7122 },
  { name: 'Colombia', lat: 4.5709, lng: -74.2973 },
  { name: 'Guatemala', lat: 15.7835, lng: -90.2308 },
];

export const COFFEE_ORIGIN_LIST = [
  "Ethiopia", "Brazil", "Vietnam", "Colombia", "Indonesia", "Honduras", 
  "India", "Mexico", "Peru", "Uganda", "Guatemala", "Ivory Coast", 
  "Nicaragua", "Malaysia", "Kenya", "Tanzania", "Papua New Guinea", 
  "El Salvador", "Laos", "Madagascar", "Thailand", "Costa Rica", 
  "Philippines", "Rwanda", "Guinea", "Burundi", "Togo", "Cameroon", 
  "Panama", "Jamaica", "China (Yunnan)", "China (Hainan)", 
  "Taiwan (China)", "Hong Kong (China)", "Macau (China)", 
  "USA (Hawaii)", "USA (Puerto Rico)", "Yemen", "Ecuador", 
  "Dominican Republic", "East Timor", "Bolivia", "Zambia", "Zimbabwe", 
  "Angola", "Malawi", "United States", "United Kingdom", "Canada", 
  "France", "Germany", "Italy", "Japan", "South Korea", "Singapore", 
  "Australia", "New Zealand", "Netherlands", "Switzerland", "Spain", 
  "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria", 
  "Russia", "Turkey", "Saudi Arabia", "UAE", "Israel", "South Africa", 
  "Egypt", "Nigeria", "Argentina", "Chile", "Poland", "Greece", 
  "Portugal", "Czech Republic", "Hungary", "Ireland", "Iceland"
];