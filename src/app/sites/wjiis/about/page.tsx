'use client';

import { Users, Target, Globe, BookOpen, TrendingUp, Award } from 'lucide-react';
import DynamicSEO from '@/components/shared/DynamicSEO';
import WebsiteSchema from '@/components/shared/schema/WebsiteSchema';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export default function AboutPage() {
  return (
    <>
      <DynamicSEO
        title="About WJIIS - World Journal of Interdisciplinary Innovation Sciences"
        description="Learn about WJIIS's mission, vision, and commitment to advancing interdisciplinary research. A peer-reviewed, open-access journal publishing rigorous scholarship across disciplines."
        keywords={[
          'about WJIIS',
          'interdisciplinary journal',
          'innovation sciences',
          'peer review',
          'open access journal',
          'international journal',
          'scholarly publishing',
          'WJIIS'
        ]}
        canonicalUrl="/about"
      />
      <WebsiteSchema
        name="WJIIS About Page"
        url="https://wjiis.com/about"
        description="Learn about the World Journal of Interdisciplinary Innovation Sciences - our mission, vision, research areas, and editorial standards."
      />
      <div className="bg-white py-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' }
            ]}
          />
        </div>
      </div>

      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">About WJIIS</h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The World Journal of Interdisciplinary Innovation Sciences (WJIIS) is a peer-reviewed, open-access academic journal committed to publishing rigorous research that transcends traditional disciplinary boundaries.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg mr-4" style={{background: '#e8f6f8'}}>
                  <Target className="h-6 w-6" style={{color: '#1a6b7a'}} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Advancing knowledge through rigorous, interdisciplinary scholarship that addresses real-world challenges. We publish research that transcends traditional disciplinary boundaries to foster innovation and scientific progress.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg mr-4" style={{background: '#e8f6f8'}}>
                  <Globe className="h-6 w-6" style={{color: '#1a6b7a'}} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Our Vision</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                To foster global scholarly collaboration across disciplines to tackle complex problems, while democratizing knowledge through open-access publishing to accelerate scientific progress worldwide.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-12">Why Choose WJIIS?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-6" style={{background: '#e8f6f8'}}>
                  <Award className="h-6 w-6" style={{color: '#1a6b7a'}} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Rigorous Peer Review</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our double-blind peer review process ensures the highest quality standards and academic integrity.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-6" style={{background: '#e8f6f8'}}>
                  <Globe className="h-6 w-6" style={{color: '#1a6b7a'}} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Global Reach</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Published research reaches a worldwide audience of academics, practitioners, and policymakers.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-6" style={{background: '#e8f6f8'}}>
                  <TrendingUp className="h-6 w-6" style={{color: '#1a6b7a'}} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Impact & Innovation</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We prioritize research that drives innovation and creates meaningful impact in business and society.
                </p>
              </div>
            </div>
          </div>

          {/* Research Areas */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 md:p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Research Areas</h2>
              <p className="text-slate-600">Covering a wide spectrum of disciplines in commerce and management.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Natural Sciences', desc: 'Physics, chemistry, biology, and interdisciplinary natural science research.' },
                { title: 'Engineering & Technology', desc: 'Applied engineering, emerging technologies, and innovative solutions.' },
                { title: 'Medicine & Health Sciences', desc: 'Clinical research, public health, and biomedical innovations.' },
                { title: 'Environmental Sciences', desc: 'Climate change, sustainability, ecology, and environmental policy.' },
                { title: 'Social Sciences', desc: 'Sociology, economics, psychology, and cross-cultural studies.' },
                { title: 'Computational Sciences', desc: 'AI, data science, algorithms, and computational methodologies.' }
              ].map((area, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-6 border border-slate-100 hover:border-slate-300 transition-colors">
                  <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">{area.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Strip */}
          <div className="rounded-lg p-12 text-white mb-16" style={{background: 'linear-gradient(135deg, #1a3a4a 0%, #1a6b7a 100%)'}}>
            <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x" style={{borderColor: 'rgba(255,255,255,0.15)'}}>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold mb-2">2025</div>
                <div className="text-sm uppercase tracking-wider" style={{color: '#87d4e0'}}>Established</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-sm uppercase tracking-wider" style={{color: '#87d4e0'}}>Countries Represented</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold mb-2">4–6</div>
                <div className="text-sm uppercase tracking-wider" style={{color: '#87d4e0'}}>Weeks Review Timeline</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold mb-2">Monthly</div>
                <div className="text-sm uppercase tracking-wider" style={{color: '#87d4e0'}}>Publication Frequency</div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center bg-white p-12 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Join Our Academic Community</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a researcher looking to publish your work or an academic seeking cutting-edge insights, WJIIS welcomes you to be part of our global interdisciplinary community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/submit"
                className="inline-flex items-center justify-center px-8 py-3 text-white rounded-md transition-colors font-medium"
                style={{background: '#e8622a'}}
              >
                Submit Your Research
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md transition-colors font-medium"
                style={{border: '1px solid #1a6b7a', color: '#1a6b7a'}}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
