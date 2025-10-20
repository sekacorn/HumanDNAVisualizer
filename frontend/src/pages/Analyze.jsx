import { useState } from 'react'
import DataUpload from '../components/DataUpload'
import TraitDetails from '../components/TraitDetails'
import LLMChat from '../components/LLMChat'

function Analyze() {
  const [userId, setUserId] = useState('user_' + Math.random().toString(36).substr(2, 9))
  const [predictions, setPredictions] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({
    vcf: false,
    fhir: false,
    csv: false
  })

  const handlePredictionsUpdate = (newPredictions) => {
    setPredictions(newPredictions)
  }

  const handleUploadSuccess = (dataType) => {
    setUploadStatus(prev => ({ ...prev, [dataType]: true }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Analyze Your DNA
      </h1>

      {/* User ID Display */}
      <div className="card mb-8 text-center">
        <p className="text-gray-400">Your Session ID: <span className="text-blue-400 font-mono">{userId}</span></p>
      </div>

      {/* Upload Status */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className={`card text-center ${uploadStatus.vcf ? 'border-green-500' : 'border-gray-700'}`}>
          <div className="text-2xl mb-2">{uploadStatus.vcf ? '✅' : '📄'}</div>
          <p className="text-gray-300">Genomic Data (VCF)</p>
        </div>
        <div className={`card text-center ${uploadStatus.fhir ? 'border-green-500' : 'border-gray-700'}`}>
          <div className="text-2xl mb-2">{uploadStatus.fhir ? '✅' : '🏥'}</div>
          <p className="text-gray-300">Health Records (FHIR)</p>
        </div>
        <div className={`card text-center ${uploadStatus.csv ? 'border-green-500' : 'border-gray-700'}`}>
          <div className="text-2xl mb-2">{uploadStatus.csv ? '✅' : '📊'}</div>
          <p className="text-gray-300">Lifestyle Data (CSV)</p>
        </div>
      </div>

      {/* Data Upload Component */}
      <div className="mb-8">
        <DataUpload
          userId={userId}
          onPredictionsUpdate={handlePredictionsUpdate}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>

      {/* Trait Predictions Display */}
      {predictions && (
        <div className="mb-8">
          <TraitDetails predictions={predictions} />
        </div>
      )}

      {/* LLM Chat Interface */}
      <div className="mb-8">
        <LLMChat userId={userId} />
      </div>
    </div>
  )
}

export default Analyze
