import React from 'react';
import { OFFERS, BRAND_COLOR } from '../constants';
import { Gift, CheckCircle2, Clock, Zap } from 'lucide-react';

const OffersSection: React.FC = () => {
  const handleSelectOffer = (offerId: number) => {
    // 1. Dispatch custom event to notify BookingForm
    const event = new CustomEvent('offer-selected', { detail: { offerId } });
    window.dispatchEvent(event);

    // 2. Scroll to booking section
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="offers" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-red-600 text-sm font-bold animate-pulse mb-3">
             ⏳ LIMITED TIME DEAL
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            🔥 YEAR END FEST
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Buy One Service, Get Another <span className="text-red-600 font-bold bg-red-50 px-2 rounded">ABSOLUTELY FREE!</span>
          </p>
          <div className="mt-4 flex justify-center">
             <div className="flex items-center text-sm font-medium text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                <Clock className="w-4 h-4 mr-2" />
                Offer valid while slots last
             </div>
          </div>
        </div>

        <div className="grid gap-6 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {OFFERS.map((offer) => (
            <div key={offer.id} className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                 SAVE {offer.freePrice} TK
              </div>

              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: BRAND_COLOR }}>
                     {offer.id}
                   </div>
                   {offer.id % 3 === 0 && (
                      <span className="text-xs font-semibold text-orange-500 flex items-center bg-orange-50 px-2 py-1 rounded">
                        <Zap className="w-3 h-3 mr-1 fill-current" />
                        Selling Fast
                      </span>
                   )}
                </div>

                <div className="space-y-6 flex-1">
                   {/* Buy Section */}
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-start">
                         <div className="bg-white p-1.5 rounded-full shadow-sm mr-3">
                            <CheckCircle2 className="w-5 h-5 text-gray-700" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Buy Service</p>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {offer.emoji} {offer.buyItem}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Value: {offer.buyPrice} TK</p>
                         </div>
                      </div>
                   </div>

                   {/* Free Section */}
                   <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-pink-100 rounded-full opacity-50 blur-xl"></div>
                      <div className="flex items-start relative z-10">
                         <div className="bg-white p-1.5 rounded-full shadow-sm mr-3">
                             <Gift className="w-5 h-5 text-pink-600" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-pink-600 uppercase tracking-wide">Get Free</p>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight" style={{ color: BRAND_COLOR }}>{offer.freeItem}</h3>
                            <p className="text-sm font-bold text-gray-800 mt-1">
                               Worth: {offer.freePrice} TK
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSelectOffer(offer.id)}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gray-900 group-hover:bg-pink-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-pink-200"
                  >
                    Claim Offer #{offer.id}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 group-hover:text-pink-600 transition-colors">
                     Limited daily slots available
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersSection;