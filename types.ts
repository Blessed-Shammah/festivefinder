// Data structures for the app

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface DealProduct {
  id: string;
  name: string;
  price: string;
  store: string;
  description: string;
  category: string;
  imageUrl?: string;
  productUrl?: string;
  dealEnd?: string;
}

export interface SearchResult {
  rawText: string;
  parsedProducts: DealProduct[];
  sources: GroundingChunk[];
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADING_MORE = 'LOADING_MORE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  query: string;
}

export type SearchMode = 'fast' | 'extended';