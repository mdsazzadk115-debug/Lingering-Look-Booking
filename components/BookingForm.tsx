import React, { useState, useEffect } from 'react';
import { BRANCHES, OFFERS, BRAND_COLOR } from '../constants';
import { saveLead } from '../services/storageService';
import { Calendar, Clock, MapPin, Gift, User, Phone, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { Lead } from '../types';

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch: BRANCHES[0].name,
    offerId: OFFERS[0].id,
    date: '',
    time: ''
  });
  
  // Unique ID for this session to track incomplete data (Safe for all browsers)
  const [sessionId] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-fill Date and Time on Mount
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setFormData(prev => ({
        ...prev,
        date: dateStr,
        time: timeStr
    }));
  }, []);

  // Listen for 'offer-selected' event
  useEffect(() => {
    const handleOfferSelection = (e: Event) => {
        const customEvent = e as CustomEvent<{ offerId: number }>;
        if (customEvent.detail && customEvent.detail.offerId) {
            setFormData(prev => ({
                ...prev,
                offerId: customEvent.detail.offerId
            }));
        }
    };

    window.addEventListener('offer-selected', handleOfferSelection);
    return () => {
        window.removeEventListener('offer-selected', handleOfferSelection);
    };
  }, []);

  // Auto-Save / Abandoned Cart Logic
  useEffect(() => {
      if (formData.phone.length >= 11 && !isSuccess) {
          const timeoutId = setTimeout(() => {
              const abandonedLead: Lead = {
                  id: sessionId,
                  name: formData.name || 'Anonymous User',
                  phone: formData.phone,
                  branchName: formData.branch,
                  offerId: Number(formData.offerId),
                  appointmentDate: formData.date,
                  appointmentTime: formData.time,
                  submittedAt: new Date().toISOString(),
                  status: 'Abandoned'
              };
              saveLead(abandonedLead);
          }, 1500); 

          return () => clearTimeout(timeoutId);
      }
  }, [formData, sessionId, isSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 1. Find details
    const selectedOffer = OFFERS.find(o => o.id === Number(formData.offerId));
    if (!selectedOffer) {
        setIsSubmitting(false);
        return;
    }

    // 2. Save Lead (Switches status from Abandoned to New)
    const newLead: Lead = {
      id: sessionId,
      name: formData.name,
      phone: formData.phone,
      branchName: formData.branch,
      offerId: Number(formData.offerId),
      appointmentDate: formData.date,
      appointmentTime: formData.time,
      submittedAt: new Date().toISOString(),
      status: 'New'
    };
    
    const saved = await saveLead(newLead);
    setIsSubmitting(false);

    if (saved) {
        setIsSuccess(true);
    } else {
        alert("There was a problem saving your booking. Please check your internet connection and try again.");
    }
  };

  if (isSuccess) {
      return (
          <div id="booking" className="py-16 bg-pink-50">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-t-4" style={{ borderColor: BRAND_COLOR }}>
                      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                          <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Booking Received!</h3>
                      <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                          Thank you <strong>{formData.name}</strong>. Your appointment request has been successfully submitted.<br/>
                          We will call you at <span className="font-bold text-gray-800">{formData.phone}</span> shortly to confirm your slot.
                      </p>
                      <button 
                          onClick={() => window.location.reload()}
                          className="px-8 py-3 rounded-md text-white font-bold transition-all shadow-lg hover:brightness-110"
                          style={{ backgroundColor: BRAND_COLOR }}
                      >
                          Book Another Service
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div id="booking" className="py-16 bg-pink-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Discount Highlight Banner */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-1">
            <div className="bg-white rounded-md p-4 flex items-center justify-center text-center">
              <div>
                <span className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-orange-600 mb-1">
                   <Zap className="w-6 h-6 fill-current animate-pulse" />
                   SPECIAL DISCOUNT!
                   <Zap className="w-6 h-6 fill-current animate-pulse" />
                </span>
                <p className="text-gray-800 font-medium text-lg">
                  আজকে এখনই যদি আপনি বুকিং করেন সে ক্ষেত্রে পাবেন <span className="font-bold text-red-600 bg-red-50 px-2 rounded">১০% ডিসকাউন্ট!</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4" style={{ borderColor: BRAND_COLOR }}>
          <div className="px-6 py-8 sm:p-10 text-center text-white" style={{ backgroundColor: BRAND_COLOR }}>
            <h3 className="text-3xl font-bold">Book Your Appointment</h3>
            <p className="mt-2 text-pink-100">
               সিলেক্ট করুন আপনার অফার, ব্রাঞ্চ এবং সময়। সাবমিট করলেই আপনার বুকিং কনফার্ম হবে!
            </p>
          </div>
          
          <div className="px-6 py-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      required
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      required
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Offer & Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="offerId" className="block text-sm font-medium text-gray-700">Select Offer</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Gift className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="offerId"
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      value={formData.offerId}
                      onChange={handleChange}
                    >
                      {OFFERS.map(offer => (
                        <option key={offer.id} value={offer.id}>
                          {offer.emoji} {offer.buyItem} ({offer.buyPrice} TK)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Select Branch</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="branch"
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      {BRANCHES.map(branch => (
                        <option key={branch.name} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      required
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">Preferred Time</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      name="time"
                      required
                      className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      value={formData.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all shadow-pink-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking (Get 10% OFF)
                    </>
                  )}
                </button>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  * By clicking submit, your details will be saved to our client list for future offers.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;