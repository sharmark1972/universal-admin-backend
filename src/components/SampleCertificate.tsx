'use client';

import { useState } from 'react';
import { Award, Eye, X, FileText, Star, Shield, AlertCircle } from 'lucide-react';
import Certificate from './Certificate';

export default function SampleCertificate() {
  const [showModal, setShowModal] = useState(false);

  const sampleData = {
    certificateNumber: 'IJARCM-2025-SAMPLE',
    authorName: 'Dr. Jane Smith',
    title: 'Digital Transformation in Modern Business: A Comprehensive Analysis of E-commerce Adoption Strategies and Their Impact on Organizational Performance',
    institution: 'University of Excellence, Department of Business Administration',
    issuedAt: new Date().toISOString(),
    type: 'PUBLICATION' as const,
  };

  return (
    <>
      {/* Sample Certificate Preview Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white shadow-lg">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Digital Certificates</h3>
            <p className="text-gray-600 text-sm">Professional recognition for published authors</p>
          </div>
        </div>

        {/* Mini Certificate Preview */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-4 border-double border-blue-200 rounded-xl p-6 mb-6 relative overflow-hidden shadow-inner">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-blue-300 rounded-full"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-2 border-blue-300 rounded-full"></div>
            <div className="absolute bottom-2 left-4 w-7 h-7 border-2 border-blue-300 rounded-full"></div>
            <div className="absolute bottom-4 right-2 w-5 h-5 border-2 border-blue-300 rounded-full"></div>
          </div>

          <div className="text-center relative z-10">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-blue-800 mb-2">
              CERTIFICATE OF PUBLICATION
            </h4>
            <div className="w-20 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-3"></div>
            <p className="text-xs text-gray-600 mb-3 font-medium">
              &quot;International Journal of Research in Computer Applications and Management&quot;
            </p>
            
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">This is to certify that the above-named individual is</p>
              <h5 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-1 inline-block">
                Dr. Jane Smith
              </h5>
              <p className="text-xs text-gray-500 italic mt-1">
                University of Excellence
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">For the research paper:</p>
              <p className="text-sm font-medium text-gray-700 italic leading-tight">
                &quot;Digital Transformation in Modern Business...&quot;
              </p>
            </div>

            {/* Disclaimer Preview */}
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                <span className="text-gray-600">For personal & academic use only</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-3">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600" />
                <span className="text-gray-500">IJARCM-2025-SAMPLE</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-500">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-sm text-gray-700">Automatically generated for published papers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-sm text-gray-700">Professional PDF format with unique certificate number</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-sm text-gray-700">Verifiable digital credentials for academic portfolios</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-sm text-gray-700">Instant download after paper approval</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-sm"></div>
            <span className="text-sm text-gray-700">Includes usage disclaimer for clarity</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
        >
          <Eye className="w-5 h-5" />
          View Full Certificate Sample
        </button>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Professional recognition for your academic achievements
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ maxWidth: '1220px' }}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sample Certificate Preview</h3>
                  <p className="text-sm text-gray-600">Professional certificate format with disclaimer</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="px-6 pt-4">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-blue-800 mb-1">Preview Mode:</p>
                    <p className="text-gray-600">
                      This is a sample certificate demonstrating the format and design. 
                      Actual certificates are generated automatically when papers are approved and published.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
            <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
              <Certificate
                {...sampleData}
                isPreview={true}
                showDownload={false}
              />
            </div>

            <div className="px-6 pb-6 text-center space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Certificate Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Professional design with institutional branding</li>
                    <li>• Unique certificate number for verification</li>
                    <li>• Clear disclaimer for appropriate usage</li>
                    <li>• Digital verification capabilities</li>
                    <li>• High-quality PDF download format</li>
                  </ul>
                </div>
                
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close Preview
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}