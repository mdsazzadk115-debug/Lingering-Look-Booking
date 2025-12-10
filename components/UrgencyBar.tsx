import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { BRAND_COLOR } from '../constants';

const UrgencyBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [bookingsToday, setBookingsToday] = useState(12);

  useEffect(() => {
    // Show after 2 seconds
    const timer = setTimeout(() => setIsVisible(true), 2000);
    
    // Fake bookings counter
    const bookingInterval = setInterval(() => {
        setBookingsToday(prev => prev + 1);
    }, 45000);

    // Countdown to midnight
    const countdown = setInterval(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => {
        clearTimeout(timer);
        clearInterval(bookingInterval);
        clearInterval(countdown);
    };
  }, []);

  if (!isVisible) return null;

  const handleScrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-xl shadow-2xl border-t-2 border-pink-500 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white"
        >
            <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
             <div className="bg-pink-600 p-2 rounded-lg animate-pulse">
                <Clock className="w-6 h-6 text-white" />
             </div>
             <div>
                <p className="font-bold text-lg">Year End Offer Ends Soon!</p>
                <p className="text-sm text-gray-300">
                   <span className="text-green-400 font-bold">{bookingsToday} people</span> booked today. Time left: <span className="font-mono text-yellow-400">{timeLeft}</span>
                </p>
             </div>
        </div>

        <button 
            onClick={handleScrollToBooking}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-white shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
            style={{ backgroundColor: BRAND_COLOR }}
        >
            Claim Discount Now
        </button>
      </div>
    </div>
  );
};

export default UrgencyBar;