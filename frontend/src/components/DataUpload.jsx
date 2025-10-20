import { useState } from 'react'
import { uploadVCF, uploadCSV, predictTraits, getGenomicData } from '../services/api'
import DOMPurify from 'dompurify'

function DataUpload({ userId, onPredictionsUpdate, onUploadSuccess }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadType, setUploadType] = useState('vcf')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setMessage(`Selected: ${DOMPurify.sanitize(file.name)}`)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first')
      return
    }

    setLoading(true)
    setMessage('Uploading...')

    try {
      let response
      if (uploadType === 'vcf') {
        response = await uploadVCF(selectedFile, userId)
        if (response.data.success) {
          onUploadSuccess('vcf')
          setMessage(`✅ VCF uploaded: ${response.data.recordsProcessed} variants processed`)

          // Automatically run predictions after VCF upload
          await runPredictions()
        }
      } else if (uploadType === 'csv') {
        response = await uploadCSV(selectedFile, userId)
        if (response.data.success) {
          onUploadSuccess('csv')
          setMessage(`✅ CSV uploaded: ${response.data.recordsProcessed} records processed`)
        }
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const runPredictions = async () => {
    setLoading(true)
    setMessage('Running AI predictions...')

    try {
      const genomicResponse = await getGenomicData(userId)
      const variants = genomicResponse.data.map(item => ({
        chromosome: item.chromosome,
        position: item.position,
        referenceAllele: item.referenceAllele,
        alternateAllele: item.alternateAllele
      }))

      const predictResponse = await predictTraits(userId, { variants })
      onPredictionsUpdate(predictResponse.data)
      setMessage('✅ Predictions complete!')
    } catch (error) {
      setMessage(`❌ Prediction failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Upload Data</h2>

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Data Type:</label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="vcf">Genomic Data (VCF)</option>
          <option value="csv">Lifestyle Data (CSV)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Select File:</label>
        <input
          type="file"
          accept={uploadType === 'vcf' ? '.vcf,.txt' : '.csv'}
          onChange={handleFileSelect}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Upload & Analyze'}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg text-gray-300">
          {message}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
        <h4 className="font-semibold text-blue-300 mb-2">Supported Formats:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• VCF files from 23andMe, AncestryDNA</li>
          <li>• CSV lifestyle surveys</li>
          <li>• FASTA and PDB files (coming soon)</li>
        </ul>
      </div>
    </div>
  )
}

export default DataUpload
