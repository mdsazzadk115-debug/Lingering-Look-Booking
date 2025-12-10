import React from 'react';
import { Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { BRAND_COLOR } from '../constants';

const benefits = [
  {
    title: "Premium Products",
    description: "আপনার ত্বকের যত্নে আমরা ব্যবহার করি বিশ্বমানের ও অথেন্টিক ব্র্যান্ডের প্রসাধনী।",
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    color: "bg-yellow-50"
  },
  {
    title: "Expert Estheticians",
    description: "আমাদের প্রতিটি সেবায় পাচ্ছেন অভিজ্ঞ ও ট্রেইনড বিউটি এক্সপার্টদের ছোঁয়া।",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    color: "bg-green-50"
  },
  {
    title: "Relaxing Ambiance",
    description: "শহরের কোলাহল ছেড়ে আমাদের শান্ত ও মনোরম পরিবেশে উপভোগ করুন রিলাক্সিং সময়।",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    color: "bg-pink-50"
  },
  {
    title: "Hygiene Guaranteed",
    description: "আপনার সুরক্ষাই আমাদের অগ্রাধিকার। আমরা মেনে চলি কঠোর হাইজিন প্রটোকল।",
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-50"
  }
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base font-bold tracking-wide uppercase" style={{ color: BRAND_COLOR }}>
            Why Choose Us?
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Experience the Lingering Look Difference
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
            আমরা শুধু সেবা দেই না, আমরা নিশ্চিত করি আপনার প্রশান্তি এবং সৌন্দর্য।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-300 shadow-md ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Trust Section */}
        <div className="mt-20 rounded-2xl bg-gray-900 text-white overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-pink-900/20 mix-blend-overlay"></div>
            <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        "বছরের সেরা অফারটি লুফে নিতে আজই বুক করুন!"
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg">
                        আমাদের এক্সপার্টদের সাথে কথা বলুন এবং আপনার স্কিন বা হেয়ারের জন্য সেরা ট্রিটমেন্টটি বেছে নিন। অফারটি সীমিত সময়ের জন্য!
                    </p>
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-pink-500">2+</span>
                            <span className="text-xs text-gray-400">Branches</span>
                        </div>
                        <div className="h-10 w-px bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-pink-500">10k+</span>
                            <span className="text-xs text-gray-400">Happy Clients</span>
                        </div>
                        <div className="h-10 w-px bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-pink-500">100%</span>
                            <span className="text-xs text-gray-400">Satisfaction</span>
                        </div>
                    </div>
                </div>
                <div className="relative h-64 md:h-auto">
                    <img 
                        src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=2070&auto=format&fit=crop" 
                        alt="Salon Interior" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900"></div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;