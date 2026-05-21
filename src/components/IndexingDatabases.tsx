'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Award, Database } from 'lucide-react';

interface IndexingDatabase {
  name: string;
  logo: string;
  url: string;
  alt: string;
}

const DatabaseCard = ({ database, index }: { database: IndexingDatabase; index: number }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <a
      href={database.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-indigo-100 overflow-hidden animate-slide-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      <div className="relative z-10">
        {/* Logo container */}
        <div className="flex items-center justify-center mb-6 h-32 relative">
          {!imageError ? (
            <Image
              src={database.logo}
              alt={database.alt}
              fill
              className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-5xl font-bold text-gradient-animate">{database.name.charAt(0)}</div>
            </div>
          )}
        </div>

        {/* Database name */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {database.name}
          </h3>
          <div className="flex items-center justify-center text-sm text-gray-500 group-hover:text-indigo-500 transition-colors">
            <Award className="w-4 h-4 mr-1" />
            <span className="font-medium">Verified Indexing</span>
          </div>
        </div>

        {/* External link indicator */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
};

const IndexingDatabases = () => {
  const databases: IndexingDatabase[] = [
    {
      name: 'Google Scholar',
      logo: '/images/indexing/google-scholar.svg',
      url: 'https://scholar.google.com',
      alt: 'Google Scholar Logo'
    },
    {
      name: 'Scribd',
      logo: '/images/indexing/scribd.svg',
      url: 'https://www.scribd.com',
      alt: 'Scribd Logo'
    },
    {
      name: 'Copernicus',
      logo: '/images/indexing/copernicus.svg',
      url: 'https://www.copernicus.eu',
      alt: 'Copernicus Logo'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold mb-4 shadow-lg">
            <Database className="w-4 h-4 mr-2" />
            Indexed In
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Indexing Databases
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our journal is indexed in prestigious databases ensuring maximum visibility and discoverability of your research
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {databases.map((database, index) => (
            <DatabaseCard key={database.name} database={database} index={index} />
          ))}
        </div>

        {/* Additional info banner */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Enhanced Research Visibility</h4>
                <p className="text-gray-600 text-sm">
                  Articles published in IJARCM are discoverable across multiple prestigious academic databases, ensuring maximum reach and impact for your research.
                </p>
              </div>
            </div>
            <a
              href="/about"
              className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndexingDatabases;
