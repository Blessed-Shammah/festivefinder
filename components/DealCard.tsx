import React, { useState } from 'react';
import { DealProduct } from '../types';
import { TagIcon, ExternalLinkIcon, ShareIcon, CheckIcon, ClockIcon } from './Icons';

interface DealCardProps {
  deal: DealProduct;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Logic for Image URL:
  // 1. Use deal.imageUrl if provided by API (rare for text search)
  // 2. Fallback to Pollinations.ai for a dynamic, relevant AI generated product shot
  const imageUrl = deal.imageUrl || `https://image.pollinations.ai/prompt/high%20quality%20product%20photography%20of%20${encodeURIComponent(deal.name)}%20${encodeURIComponent(deal.category)}%20white%20background?width=400&height=300&nologo=true&seed=${deal.id}`;

  // Logic for Product URL:
  // 1. Use deal.productUrl if provided
  // 2. Fallback to a Google Search for that specific product + store
  const productLink = deal.productUrl || `https://www.google.com/search?q=${encodeURIComponent(deal.name + ' ' + deal.store + ' price')}&tbm=shop`;

  const handleShare = async () => {
    const shareData = {
      title: `Deal found: ${deal.name}`,
      text: `Check out this deal for ${deal.name} at ${deal.store} for ${deal.price}!`,
      url: productLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop/unsupported browsers
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      {/* Image Header */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
         <img 
           src={imageUrl} 
           alt={deal.name}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
           loading="lazy"
           onError={(e) => {
             // Fallback if AI image fails
             (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Festive+Deal';
           }}
         />
         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 text-gray-800 text-xs font-bold shadow-sm border border-gray-100">
            {deal.store}
         </div>
         {/* Overlay gradient */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
             <span className="text-white text-sm font-medium">View Deal</span>
         </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <span className="inline-flex items-center text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
               <TagIcon className="w-3 h-3 mr-1" />
               {deal.category || 'Deal'}
            </span>
        </div>
        
        <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-2">
           {deal.name}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {deal.description}
        </p>

        {/* Expiration Indicator */}
        {deal.dealEnd && (
          <div className="flex items-center text-xs font-semibold text-orange-600 mb-4 bg-orange-50 w-fit px-2 py-1 rounded-md border border-orange-100">
            <ClockIcon className="w-3.5 h-3.5 mr-1" />
            {deal.dealEnd}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="text-2xl font-bold text-festive-red">
            {deal.price}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-festive-red hover:bg-red-50 rounded-full transition-colors relative"
              title="Share Deal"
              aria-label="Share Deal"
            >
              {isCopied ? (
                 <CheckIcon className="w-5 h-5 text-green-500" />
              ) : (
                 <ShareIcon className="w-5 h-5" />
              )}
              
              {/* Tooltip for copied state */}
              {isCopied && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap animate-fade-in-up">
                  Copied!
                </span>
              )}
            </button>
            
            <a 
              href={productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
            >
              <span>Details</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};