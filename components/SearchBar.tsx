import React, { useState } from 'react';
import { SearchIcon, SparklesIcon, FilterIcon, CheckIcon } from './Icons';
import { PLATFORMS } from '../constants';
import { SearchMode } from '../types';

interface SearchBarProps {
  onSearch: (query: string, minPrice?: string, maxPrice?: string, platforms?: string[], searchMode?: SearchMode) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>('fast');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, minPrice, maxPrice, selectedPlatforms, searchMode);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="relative group w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-festive-red via-festive-gold to-festive-green rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col bg-white rounded-xl shadow-lg transition-all border border-gray-100 overflow-hidden">
          
          {/* Main Search Row */}
          <div className="flex items-center w-full">
            <div className="pl-6 text-gray-400">
              <SearchIcon className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              placeholder="What are you looking for? (e.g. 'Cheap 4K TV')"
              className="w-full py-5 px-4 text-lg text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
            />
            
            <div className="pr-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg hover:bg-gray-100 transition-colors ${showFilters || selectedPlatforms.length > 0 ? 'bg-gray-100 text-festive-red' : 'text-gray-500'}`}
                title="Filter Options"
              >
                <FilterIcon className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  query.trim() 
                    ? 'bg-gradient-to-r from-festive-red to-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">Search</span>
                {isLoading ? <span className="animate-spin ml-2">↻</span> : <SparklesIcon className="w-4 h-4 ml-0 sm:ml-0" />}
              </button>
            </div>
          </div>

          {/* Expandable Filters Section */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 border-t border-gray-100 ${
              showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-5 space-y-5">
              
              {/* Row 1: Price and Mode */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Price Range */}
                <div className="flex-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Price Range</label>
                   <div className="flex items-center space-x-2">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        min="0"
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 focus:border-festive-red focus:ring-1 focus:ring-festive-red outline-none text-sm"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        min="0"
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 focus:border-festive-red focus:ring-1 focus:ring-festive-red outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Mode */}
                <div className="flex-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Search Mode</label>
                   <div className="flex bg-gray-200 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setSearchMode('fast')}
                        className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                          searchMode === 'fast' ? 'bg-white text-festive-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        ⚡ Fast
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchMode('extended')}
                        className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                          searchMode === 'extended' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        🔍 Extended
                      </button>
                   </div>
                </div>
              </div>

              {/* Row 2: Platforms */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Filter by Store</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all flex items-center ${
                          isSelected 
                            ? 'bg-festive-red text-white border-festive-red shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 mr-1" />}
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </form>
      
      {/* Active filters pill */}
      {(!showFilters && (minPrice || maxPrice || selectedPlatforms.length > 0 || searchMode === 'extended')) && (
         <div className="mt-2 flex flex-wrap gap-2 justify-center">
             {(minPrice || maxPrice) && (
               <div className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500 shadow-sm flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                 ${minPrice || '0'} - ${maxPrice || 'Any'}
               </div>
             )}
             {selectedPlatforms.map(p => (
               <div key={p} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500 shadow-sm flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                 {p}
               </div>
             ))}
             {searchMode === 'extended' && (
                <div className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-purple-500 shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Extended Search
               </div>
             )}
         </div>
      )}
    </div>
  );
};
