import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadCard from '../components/UploadCard'
import { importVCF, importGenotype } from '../services/api'
import authService from '../services/authService'

/**
 * Import Page
 *
 * Upload and process genomic data files (VCF, TSV/CSV).
 * Educational/research purposes only.
 */

function Import() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [vcfUploading, setVcfUploading] = useState(false)
  const [vcfProgress, setVcfProgress] = useState(0)
  const [vcfError, setVcfError] = useState(null)
  const [vcfSuccess, setVcfSuccess] = useState(null)

  const [genotypeUploading, setGenotypeUploading] = useState(false)
  const [genotypeProgress, setGenotypeProgress] = useState(0)
  const [genotypeError, setGenotypeError] = useState(null)
  const [genotypeSuccess, setGenotypeSuccess] = useState(null)

  const handleVCFUpload = async (file) => {
    if (!user) {
      setVcfError('User not authenticated')
      return
    }

    try {
      setVcfUploading(true)
      setVcfProgress(0)
      setVcfError(null)
      setVcfSuccess(null)

      // Simulate progress (real progress would require backend support)
      const progressInterval = setInterval(() => {
        setVcfProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await importVCF(file, user.userId || user.username)

      clearInterval(progressInterval)
      setVcfProgress(100)

      setVcfSuccess({
        sampleId: response.data.sampleId,
        variantCount: response.data.variantCount,
        message: response.data.message || 'VCF file imported successfully'
      })

      // Navigate to samples page after 2 seconds
      setTimeout(() => {
        navigate('/samples')
      }, 2000)

    } catch (error) {
      console.error('VCF upload error:', error)
      setVcfError(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload VCF file. Please check the file format and try again.'
      )
    } finally {
      setVcfUploading(false)
    }
  }

  const handleGenotypeUpload = async (file) => {
    if (!user) {
      setGenotypeError('User not authenticated')
      return
    }

    try {
      setGenotypeUploading(true)
      setGenotypeProgress(0)
      setGenotypeError(null)
      setGenotypeSuccess(null)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenotypeProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await importGenotype(file, user.userId || user.username)

      clearInterval(progressInterval)
      setGenotypeProgress(100)

      setGenotypeSuccess({
        sampleId: response.data.sampleId,
        variantCount: response.data.variantCount,
        message: response.data.message || 'Genotype file imported successfully'
      })

      // Navigate to samples page after 2 seconds
      setTimeout(() => {
        navigate('/samples')
      }, 2000)

    } catch (error) {
      console.error('Genotype upload error:', error)
      setGenotypeError(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload genotype file. Please check the file format and try again.'
      )
    } finally {
      setGenotypeUploading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Import Genomic Data
        </h1>
        <p className="text-gray-400">
          Upload your genomic data files for visualization and association modeling
        </p>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold text-blue-400 mb-2">What We Accept</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• <strong>VCF Files:</strong> Standard variant call format (.vcf, .vcf.gz)</li>
            <li>• <strong>TSV/CSV Files:</strong> Tab or comma-separated genotype data</li>
            <li>• <strong>File Size:</strong> Up to 100MB per file</li>
            <li>• <strong>Reference:</strong> GRCh37/hg19 or GRCh38/hg38</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Processing Steps</h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li>1. <strong>Validate:</strong> Check file format and structure</li>
            <li>2. <strong>Parse:</strong> Extract genomic variant data</li>
            <li>3. <strong>Store:</strong> Save in canonical database schema</li>
            <li>4. <strong>Model:</strong> Generate anatomy associations</li>
          </ol>
        </div>
      </div>

      {/* Upload sections */}
      <div className="space-y-8">
        {/* VCF Upload */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">VCF Format</h2>
          <UploadCard
            accept=".vcf,.vcf.gz"
            maxSizeMB={100}
            onUpload={handleVCFUpload}
            uploading={vcfUploading}
            progress={vcfProgress}
            error={vcfError}
            title="Upload VCF File"
            description="Variant Call Format (VCF) - industry standard for genomic variants"
            disabled={vcfUploading || !!vcfSuccess}
          />

          {/* Success message */}
          {vcfSuccess && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-green-400 font-bold mb-1">Import Successful!</h4>
                  <p className="text-sm text-gray-300">{vcfSuccess.message}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Sample ID: {vcfSuccess.sampleId} | Variants: {vcfSuccess.variantCount}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Redirecting to samples page...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Genotype TSV/CSV Upload */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">TSV/CSV Format</h2>
          <UploadCard
            accept=".tsv,.csv"
            maxSizeMB={100}
            onUpload={handleGenotypeUpload}
            uploading={genotypeUploading}
            progress={genotypeProgress}
            error={genotypeError}
            title="Upload TSV/CSV File"
            description="Tab or comma-separated genotype data with flexible column mapping"
            disabled={genotypeUploading || !!genotypeSuccess}
          />

          {/* Success message */}
          {genotypeSuccess && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-green-400 font-bold mb-1">Import Successful!</h4>
                  <p className="text-sm text-gray-300">{genotypeSuccess.message}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Sample ID: {genotypeSuccess.sampleId} | Variants: {genotypeSuccess.variantCount}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Redirecting to samples page...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format help */}
      <div className="mt-8 card bg-blue-900 bg-opacity-10 border-blue-700">
        <h3 className="text-xl font-bold text-blue-400 mb-4">File Format Requirements</h3>

        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">VCF Format:</h4>
            <p className="mb-2">Standard VCF 4.x format with these columns:</p>
            <code className="block bg-gray-800 p-2 rounded text-xs text-green-400">
              #CHROM  POS     ID      REF     ALT     QUAL    FILTER  INFO    FORMAT  SAMPLE
            </code>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">TSV/CSV Format:</h4>
            <p className="mb-2">Flexible column names, must include:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Chromosome (column: chromosome, chr, chrom, or #chr)</li>
              <li>Position (column: position, pos, or start)</li>
              <li>Genotype (column: genotype, gt) OR Allele1/Allele2</li>
            </ul>
            <p className="mt-2">Optional columns: rsid, ref, alt, quality, filter</p>
          </div>
        </div>
      </div>

      {/* Educational disclaimer */}
      <div className="mt-8 card bg-yellow-900 bg-opacity-10 border-yellow-600">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-yellow-500 font-bold mb-1">Educational/Research Use Only</h4>
            <p className="text-sm text-gray-300">
              This platform is designed for educational visualization and association modeling.
              Results represent preliminary associations with evidence quality labels, not
              medical predictions or treatment recommendations. Always consult qualified healthcare
              professionals for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Import
