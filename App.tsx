import React, { useState, useCallback, useRef } from 'react';
import { CATEGORIES, SUGGESTED_QUERIES } from './constants';
import { FetchStatus, SearchResult, DealProduct, SearchMode } from './types';
import { searchDeals } from './services/geminiService';
import { SearchBar } from './components/SearchBar';
import { DealCard } from './components/DealCard';
import { LoadingState } from './components/LoadingState';
import { ExternalLinkIcon, SparklesIcon } from './components/Icons';
import { SnowEffect } from './components/SnowEffect';

interface ActiveFilters {
  min?: string;
  max?: string;
  platforms?: string[];
  searchMode?: SearchMode;
}

export default function App() {
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [errorMsg, setErrorMsg] = useState('');

  // We need to keep track of all products to support "Load More" pagination
  // This state persists across "Load More" calls but resets on new search
  const [allProducts, setAllProducts] = useState<DealProduct[]>([]);

  const handleSearch = useCallback(async (query: string, minPrice?: string, maxPrice?: string, platforms?: string[], searchMode: SearchMode = 'fast') => {
    setStatus(FetchStatus.LOADING);
    setCurrentQuery(query);
    setFilters({ min: minPrice, max: maxPrice, platforms, searchMode });
    setErrorMsg('');
    setResult(null);
    setAllProducts([]);

    try {
      const data = await searchDeals({
        query, 
        minPrice, 
        maxPrice, 
        platforms, 
        searchMode
      });
      
      setResult(data);
      setAllProducts(data.parsedProducts);
      setStatus(FetchStatus.SUCCESS);
    } catch (err: any) {
      console.error("Search error:", err);
      handleError(err);
    }
  }, []);

  const handleLoadMore = async () => {
    if (!result) return;
    
    // Set status to LOADING_MORE so we don't hide the current grid
    setStatus(FetchStatus.LOADING_MORE);
    
    const excludedNames = allProducts.map(p => p.name);

    try {
      const moreData = await searchDeals({
        query: currentQuery,
        minPrice: filters.min,
        maxPrice: filters.max,
        platforms: filters.platforms,
        searchMode: filters.searchMode, // Maintain mode, though typically 'fast' is enough for append
        excludedProductNames: excludedNames
      });

      // Merge new results
      setResult((prev) => {
        if (!prev) return moreData;
        return {
          ...prev,
          rawText: moreData.rawText, // Update text to the latest summary
          // Append new products
          parsedProducts: [...prev.parsedProducts, ...moreData.parsedProducts],
          // Merge sources, ensuring uniqueness by URI
          sources: [...prev.sources, ...moreData.sources].filter((v, i, a) => a.findIndex(t => t.web?.uri === v.web?.uri) === i)
        };
      });

      setAllProducts(prev => [...prev, ...moreData.parsedProducts]);
      setStatus(FetchStatus.SUCCESS);

    } catch (err) {
      console.error("Load More error:", err);
      // Don't fully crash, just revert to success state with error toast theoretically, 
      // but for now simple error state is fine or just stay in success.
      setStatus(FetchStatus.SUCCESS); 
      // Optionally show a temporary alert here
    }
  };

  const handleError = (err: any) => {
    let message = "We encountered an unexpected error while searching for deals.";
      
    if (err instanceof Error) {
      const errStr = err.message.toLowerCase();
      if (errStr.includes('network') || errStr.includes('failed to fetch')) {
        message = "Unable to connect. Please check your internet connection.";
      } else if (errStr.includes('429')) {
        message = "We are receiving too many requests. Please wait a moment before trying again.";
      } else if (errStr.includes('503') || errStr.includes('500')) {
        message = "Our AI service is currently experiencing high traffic. Please try again later.";
      } else if (errStr.includes('safety') || errStr.includes('blocked')) {
        message = "The search query was flagged by safety filters. Please try a different product name.";
      }
    }
    
    setErrorMsg(message);
    setStatus(FetchStatus.ERROR);
  }

  const handleRetry = () => {
    handleSearch(currentQuery, filters.min, filters.max, filters.platforms, filters.searchMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 relative overflow-x-hidden">
      
      {/* Festive Background Effects */}
      <SnowEffect />
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-red-50 to-transparent pointer-events-none -z-10" />
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={() => window.location.reload()}>
             <div className="w-8 h-8 bg-gradient-to-br from-festive-red to-orange-500 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-sm">
               <SparklesIcon className="w-5 h-5" />
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer">Festive<span className="text-festive-red">Finder</span></span>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-12 relative z-10">
        {/* Hero Section */}
        <div className={`transition-all duration-500 ${status === FetchStatus.IDLE ? 'translate-y-0' : 'translate-y-0'}`}>
          <div className="text-center mb-10">
             <div className="inline-block mb-3 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
               🎄 Seasonal Deals
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
               Discover the Season's <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-red to-purple-600">Best Discounts</span>
             </h1>
             <p className="text-lg text-gray-500 max-w-2xl mx-auto">
               Find the perfect gifts, gadgets, and goodies at the lowest prices. 
               We search real-time deals so you don't have to.
             </p>
          </div>

          <SearchBar onSearch={handleSearch} isLoading={status === FetchStatus.LOADING} />

          {/* Categories - Only show when idle */}
          {status === FetchStatus.IDLE && (
            <div className="mt-12">
              <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Browse by Category</p>
              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSearch(cat.query)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full hover:border-festive-red hover:text-festive-red hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-10 max-w-2xl mx-auto">
                 <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Searches</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_QUERIES.map((q, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSearch(q)}
                        className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State - Only for initial load */}
        {status === FetchStatus.LOADING && <LoadingState />}

        {/* Error State */}
        {status === FetchStatus.ERROR && (
           <div className="mt-12 text-center bg-red-50 p-8 rounded-2xl border border-red-100 max-w-lg mx-auto shadow-sm">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-3xl">
               ⚠️
             </div>
             <h3 className="text-red-700 text-lg font-bold mb-2">Search Unavailable</h3>
             <p className="text-gray-700 mb-6 px-4">{errorMsg}</p>
             <button 
                onClick={handleRetry}
                className="px-6 py-2 bg-festive-red text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm w-full sm:w-auto"
              >
                Try Again
              </button>
           </div>
        )}

        {/* Results State - Show if SUCCESS OR LOADING_MORE */}
        {(status === FetchStatus.SUCCESS || status === FetchStatus.LOADING_MORE) && result && (
          <div className="mt-16 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
               <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Results for "{currentQuery}"
                </h2>
                {filters.platforms && filters.platforms.length > 0 && (
                   <span className="text-xs text-gray-500">Filtered by: {filters.platforms.join(', ')}</span>
                )}
               </div>
               <button 
                 onClick={() => setStatus(FetchStatus.IDLE)} 
                 className="text-sm font-medium text-gray-500 hover:text-gray-900 underline"
               >
                 New Search
               </button>
            </div>

            {/* AI Summary Text (Last fetched summary) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 prose prose-red max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.rawText}
              </p>
            </div>

            {/* Parsed Product Grid */}
            {allProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {allProducts.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
                
                {/* Pagination / Load More */}
                <div className="flex justify-center mb-12">
                   <button
                     onClick={handleLoadMore}
                     disabled={status === FetchStatus.LOADING_MORE}
                     className="bg-white border border-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
                   >
                      {status === FetchStatus.LOADING_MORE ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Finding more deals...</span>
                        </>
                      ) : (
                        <span>Load More Results</span>
                      )}
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl mb-12">
                <p className="text-gray-500">We found the deals, but couldn't format the product cards. Please check the summary above.</p>
              </div>
            )}

            {/* Sources / Grounding */}
            {result.sources.length > 0 && (
              <div className="bg-white/50 backdrop-blur rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   Verified Sources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.web?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                    >
                      <span className="text-sm text-gray-700 truncate mr-2 font-medium">
                        {source.web?.title || 'External Source'}
                      </span>
                      <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="h-12"></div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400 z-50">
        <div className="flex items-center justify-center space-x-1">
          <span>Built with React + Tailwind + Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
