import { Category } from './types';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const CATEGORIES: Category[] = [
  { id: 'tech', name: 'Tech & Gadgets', icon: '💻', query: 'Best tech deals and gadgets discounts under $500' },
  { id: 'toys', name: 'Toys & Games', icon: '🧸', query: 'Top rated toys and games on sale for kids' },
  { id: 'home', name: 'Home & Decor', icon: '🏠', query: 'Home decor and appliance discounts' },
  { id: 'fashion', name: 'Fashion', icon: '👗', query: 'Winter fashion sales and clothing discounts' },
  { id: 'beauty', name: 'Beauty', icon: '💄', query: 'Holiday beauty sets and skincare deals' },
  { id: 'gifts', name: 'Gift Ideas', icon: '🎁', query: 'Unique holiday gift ideas under $50' },
];

export const SUGGESTED_QUERIES = [
  "4K TV deals under $400",
  "Noise cancelling headphones on sale",
  "Best perfume gift sets for her",
  "Lego sets discount",
  "Air fryer black friday deals"
];

export const PLATFORMS = [
  "Amazon",
  "Walmart",
  "Target",
  "Best Buy",
  "eBay",
  "Macy's",
  "Etsy"
];
