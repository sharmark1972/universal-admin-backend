'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, ArrowUp } from 'lucide-react';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 font-sans print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
               <div className="flex flex-col">
                  <span className="font-serif font-bold text-2xl text-white tracking-wide">IJARCM</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-slate-400 font-medium">International Academic Journal</span>
                </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Advancing knowledge in commerce, management, and technology through rigorous peer-reviewed research.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/ijarcm" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://twitter.com/ijarcm" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://linkedin.com/company/ijarcm" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Journal</Link></li>
              <li><Link href="/editorial-board" className="hover:text-white transition-colors">Editorial Board</Link></li>
              <li><Link href="/library" className="hover:text-white transition-colors">Library</Link></li>
              <li><Link href="/issues" className="hover:text-white transition-colors">Current Issue</Link></li>
            </ul>
          </div>

          {/* Authors */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">For Authors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Submit Paper</Link></li>
              <li><Link href="/submission-guidelines" className="hover:text-white transition-colors">Submission Guidelines</Link></li>
              <li><Link href="/peer-review-process" className="hover:text-white transition-colors">Peer Review Policy</Link></li>
              <li><Link href="/fees" className="hover:text-white transition-colors">Publication Fees</Link></li>
              <li><Link href="/copyright" className="hover:text-white transition-colors">Copyright Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>
                  Sharma Tower, 24, Dhawan Complex<br/>
                  Street No. 4, Vijay Nagar<br/>
                  Amritsar, Punjab - 143001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-slate-500 flex-shrink-0" />
                <a href="tel:+918562985629" className="hover:text-white">+91 8562985629</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-slate-500 flex-shrink-0" />
                <a href="mailto:editor@ijarcm.com" className="hover:text-white">editor@ijarcm.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {currentYear} IJARCM. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
             <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
             <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
      
      <button 
        onClick={scrollToTop} 
        className="fixed bottom-8 right-8 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-all z-40 print:hidden"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
};

export default Footer;
