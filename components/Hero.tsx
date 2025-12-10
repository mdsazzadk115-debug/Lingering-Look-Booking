import React from 'react';
import { BRAND_COLOR } from '../constants';
import { Sparkles, ArrowRight, Timer } from 'lucide-react';

const Hero: React.FC = () => {
  const handleScrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToOffers = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('offers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home" className="relative overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <span className="inline-flex items-center py-1 px-3 rounded-full bg-red-100 text-red-700 text-sm font-bold mb-4 animate-bounce">
                <Timer className="w-4 h-4 mr-2" />
                OFFER ENDS SOON
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight">
                <span className="block xl:inline">Biggest Beauty Sale</span>{' '}
                <span className="block" style={{ color: BRAND_COLOR }}>Of The Year!</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-medium">
                বছরের সেরা অফারটি লুফে নিন। একটি সার্ভিস কিনলেই আরেকটি পাচ্ছেন <span className="font-bold text-gray-900 bg-yellow-200 px-1">সম্পূর্ণ ফ্রি!</span> অফারটি মিস করলে সত্যিই আফসোস করবেন।
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2 text-sm text-gray-500 font-semibold sm:justify-center lg:justify-start">
                  <span className="flex items-center">✅ Authentic Products</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">✅ Expert Staff</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">✅ Premium Hygiene</span>
              </div>

              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <a
                    href="#booking"
                    onClick={handleScrollToBooking}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-white md:py-4 md:text-lg hover:brightness-110 transition-all shadow-lg shadow-pink-200"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    Book Appointment Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#offers"
                    onClick={handleScrollToOffers}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 md:py-4 md:text-lg"
                  >
                    See All Offers
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-200 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
           <img 
            src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1974&auto=format&fit=crop" 
            alt="Luxurious Beauty Makeover" 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full transition-transform hover:scale-105 duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
             <div className="text-white text-center p-4 mt-auto mb-10">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full inline-flex mb-4">
                   <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-2xl font-bold uppercase tracking-widest text-shadow">Save Up To 50% Today</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;