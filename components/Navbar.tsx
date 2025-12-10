import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND_COLOR } from '../constants';
import { Menu, Lock } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    // If we are on the home page, prevent default navigation and scroll smoothly
    if (isHome) {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
    // If we are not on home, the default href (e.g., /#offers) will handle the redirect + scroll
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a 
              href={isHome ? "#home" : "/"} 
              onClick={(e) => handleScroll(e, 'home')}
              className="flex-shrink-0 flex items-center cursor-pointer"
            >
              <span className={`text-2xl font-bold`} style={{ color: BRAND_COLOR }}>
                LINGERING LOOK
              </span>
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href={isHome ? "#home" : "/"} 
              onClick={(e) => handleScroll(e, 'home')}
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md font-medium cursor-pointer"
            >
              Home
            </a>
            <a 
              href={isHome ? "#offers" : "/#offers"} 
              onClick={(e) => handleScroll(e, 'offers')}
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md font-medium cursor-pointer"
            >
              Offers
            </a>
            <a 
              href={isHome ? "#booking" : "/#booking"} 
              onClick={(e) => handleScroll(e, 'booking')}
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md font-medium cursor-pointer"
            >
              Book Now
            </a>
            <Link to="/admin" className="flex items-center text-gray-500 hover:text-gray-800 px-3 py-2 rounded-md text-sm">
              <Lock className="w-4 h-4 mr-1" /> Staff Area
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a 
              href={isHome ? "#home" : "/"} 
              onClick={(e) => handleScroll(e, 'home')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 cursor-pointer"
            >
              Home
            </a>
            <a 
              href={isHome ? "#offers" : "/#offers"} 
              onClick={(e) => handleScroll(e, 'offers')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 cursor-pointer"
            >
              Offers
            </a>
            <a 
              href={isHome ? "#booking" : "/#booking"} 
              onClick={(e) => handleScroll(e, 'booking')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 cursor-pointer"
            >
              Book Now
            </a>
            <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100">
              Staff Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;