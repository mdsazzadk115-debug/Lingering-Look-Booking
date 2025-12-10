import React from 'react';
import { BRANCHES, HOTLINES, BRAND_COLOR } from '../constants';
import { MapPin, PhoneCall } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>LINGERING LOOK</h3>
            <p className="text-gray-400 text-sm">
              Your premium destination for beauty and wellness. Experience the best service with our exclusive year-end offers.
            </p>
          </div>

          {/* Locations */}
          <div className="space-y-4">
             <h4 className="text-lg font-semibold border-b border-gray-700 pb-2">Our Locations</h4>
             <ul className="space-y-4">
                {BRANCHES.map(branch => (
                    <li key={branch.name} className="flex items-start">
                        <MapPin className="w-5 h-5 mr-2 text-pink-500 flex-shrink-0" />
                        <div>
                            <p className="font-bold">{branch.name}</p>
                            <p className="text-sm text-gray-400">{branch.address}</p>
                            <p className="text-sm text-gray-400">📞 {branch.phone}</p>
                        </div>
                    </li>
                ))}
             </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-gray-700 pb-2">Hotline</h4>
            <ul className="space-y-2">
                {HOTLINES.map(num => (
                    <li key={num} className="flex items-center text-lg">
                        <PhoneCall className="w-5 h-5 mr-2 text-pink-500" />
                        <a href={`tel:${num}`} className="hover:text-pink-500 transition-colors">{num}</a>
                    </li>
                ))}
            </ul>
            <div className="pt-4">
                <p className="text-sm text-gray-500">Visit us at Lingering Look.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Lingering Look. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;