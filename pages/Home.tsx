import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import OffersSection from '../components/OffersSection';
import BenefitsSection from '../components/BenefitsSection';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';
import UrgencyBar from '../components/UrgencyBar';
import { trackVisit, getSettings } from '../services/storageService';

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Initialize Tracking (GA / Pixel)
    const initTracking = async () => {
        const settings = await getSettings();
        
        // Google Analytics Injection
        if (settings.googleAnalyticsId && !window.document.getElementById('ga-script')) {
          const script1 = document.createElement('script');
          script1.async = true;
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
          script1.id = 'ga-script';
          document.head.appendChild(script1);

          const script2 = document.createElement('script');
          script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.googleAnalyticsId}');
          `;
          document.head.appendChild(script2);
        }

        // Facebook Pixel Injection
        if (settings.facebookPixelId && !window.document.getElementById('fb-pixel')) {
           const script = document.createElement('script');
           script.id = 'fb-pixel';
           script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.facebookPixelId}');
            fbq('track', 'PageView');
           `;
           document.head.appendChild(script);
        }
    };
    initTracking();

    // 2. Track Internal Visit with Geolocation
    const sessionKey = 'lingering_look_session_tracked';
    const isTracked = sessionStorage.getItem(sessionKey);

    if (!isTracked) {
      const searchParams = new URLSearchParams(location.search);
      const source = searchParams.get('source');
      
      // Attempt to get location data from free IP API
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const locString = data.city ? `${data.city}, ${data.region || ''}` : 'Unknown Location';
            trackVisit(source, locString);
        })
        .catch(() => {
            trackVisit(source, 'Unknown Location');
        })
        .finally(() => {
            sessionStorage.setItem(sessionKey, 'true');
        });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <BenefitsSection />
      <OffersSection />
      <BookingForm />
      <Footer />
      <UrgencyBar />
    </div>
  );
};

export default Home;