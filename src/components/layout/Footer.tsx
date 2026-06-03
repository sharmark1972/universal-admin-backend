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
    <footer className="font-sans print:hidden text-white" style={{background: '#0d1f28', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{background: '#1a6b7a'}}>
                  <span className="font-bold text-xl tracking-wider text-white">WJ</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-white tracking-wide">WJIIS</span>
                  <span className="text-[0.65rem] uppercase tracking-widest font-medium" style={{color: '#87d4e0'}}>Academic Journal</span>
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{color: '#87d4e0'}}>
              Publishing rigorous, peer-reviewed research that bridges disciplinary boundaries and advances scientific knowledge globally.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/wjiis" className="transition-colors hover:text-white" style={{color: '#87d4e0'}}><Facebook className="h-5 w-5" /></a>
              <a href="https://twitter.com/wjiis" className="transition-colors hover:text-white" style={{color: '#87d4e0'}}><Twitter className="h-5 w-5" /></a>
              <a href="https://linkedin.com/company/wjiis" className="transition-colors hover:text-white" style={{color: '#87d4e0'}}><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm" style={{color: '#87d4e0'}}>
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Journal</Link></li>
              <li><Link href="/editorial-board" className="hover:text-white transition-colors">Editorial Board</Link></li>
              <li><Link href="/library" className="hover:text-white transition-colors">Library</Link></li>
              <li><Link href="/issues" className="hover:text-white transition-colors">Current Issue</Link></li>
            </ul>
          </div>

          {/* Authors */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">For Authors</h3>
            <ul className="space-y-2 text-sm" style={{color: '#87d4e0'}}>
              <li><Link href="/submit" className="hover:text-white transition-colors">Submit Paper</Link></li>
              <li><Link href="/submission-guidelines" className="hover:text-white transition-colors">Submission Guidelines</Link></li>
              <li><Link href="/peer-review-process" className="hover:text-white transition-colors">Peer Review Policy</Link></li>
              <li><Link href="/fees" className="hover:text-white transition-colors">Publication Fees</Link></li>
              <li><Link href="/copyright" className="hover:text-white transition-colors">Copyright Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-4 text-sm" style={{color: '#87d4e0'}}>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{color: '#5bc4d4'}} />
                <span>
                  Sharma Tower, 24, Dhawan Complex<br/>
                  Street No. 4, Vijay Nagar<br/>
                  Amritsar, Punjab - 143001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0" style={{color: '#5bc4d4'}} />
                <a href="tel:+918562985629" className="hover:text-white">+91 8562985629</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" style={{color: '#5bc4d4'}} />
                <a href="mailto:editor@wjiis.com" className="hover:text-white">editor@wjiis.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs" style={{borderTop: '1px solid rgba(255,255,255,0.1)', color: '#87d4e0'}}>
          <p>© {currentYear} WJIIS. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 text-white p-3 rounded-full shadow-lg transition-all z-40 print:hidden"
        style={{background: '#e8622a'}}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
};

export default Footer;
