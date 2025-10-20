import { Link } from 'react-router-dom'
import { useState } from 'react'

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Democratizing Genomic Insights
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Explore your DNA through interactive 3D visualizations and AI-driven trait predictions
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/analyze" className="btn-primary">
            Start Analysis
          </Link>
          <Link to="/explore" className="btn-secondary">
            Explore 3D DNA
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🧬</div>
          <h3 className="text-2xl font-bold mb-3 text-blue-400">Data Integration</h3>
          <p className="text-gray-400">
            Upload VCF files from 23andMe or AncestryDNA, FHIR health records, and lifestyle surveys for comprehensive analysis
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold mb-3 text-purple-400">3D Visualization</h3>
          <p className="text-gray-400">
            Interactive 3D DNA structures with zoom, pan, and export capabilities for research and education
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold mb-3 text-green-400">AI Predictions</h3>
          <p className="text-gray-400">
            PyTorch-powered trait predictions for health risks, cognitive traits, and ancestry insights
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-3 text-yellow-400">Natural Language Queries</h3>
          <p className="text-gray-400">
            Ask questions about your genomic data in plain English and get personalized, intuitive answers
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-2xl font-bold mb-3 text-pink-400">Global Accessibility</h3>
          <p className="text-gray-400">
            Open-source design ensures accessibility for diverse populations and low-resource settings
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold mb-3 text-red-400">Privacy & Security</h3>
          <p className="text-gray-400">
            Enterprise-grade encryption and compliance with GDPR and HIPAA standards
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Getting Started
        </h2>
        <ol className="space-y-4 text-gray-300">
          <li className="flex items-start">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
            <div>
              <strong className="text-white">Upload Your Data:</strong> Import VCF files from genetic testing services, FHIR health records, or environmental CSV files
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
            <div>
              <strong className="text-white">Analyze Traits:</strong> Run AI-powered predictions to understand your genetic predispositions for health and cognitive traits
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
            <div>
              <strong className="text-white">Visualize in 3D:</strong> Explore interactive 3D DNA structures and trait mappings
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">4</span>
            <div>
              <strong className="text-white">Get Insights:</strong> Ask questions and receive personalized recommendations based on your unique genomic profile
            </div>
          </li>
        </ol>
      </div>

      {/* Copyright Notice */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p className="mb-2">
          HumanDNAVisualizer is an original open-source work using Apache/MIT licensed libraries
        </p>
        <p>
          Compatible with VCF, FHIR, CSV, JSON, PDB, FASTA, and .dna formats without proprietary code
        </p>
      </div>
    </div>
  )
}

export default Home
