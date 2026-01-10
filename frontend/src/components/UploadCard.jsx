import { useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * UploadCard Component
 *
 * Drag-and-drop file upload with validation and progress feedback.
 * Educational/research purposes only.
 */

function UploadCard({
  accept = '.vcf,.vcf.gz,.tsv,.csv',
  maxSizeMB = 100,
  onFileSelect,
  onUpload,
  uploading = false,
  progress = 0,
  error = null,
  title = 'Upload Genomic Data',
  description = 'Drag and drop your file here, or click to browse',
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = useCallback((file) => {
    // Reset validation error
    setValidationError(null)

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
      setValidationError(errorMsg)
      return false
    }

    // Check file extension
    const fileName = file.name.toLowerCase()
    const acceptedExts = accept.split(',').map(ext => ext.trim().toLowerCase())
    const hasValidExt = acceptedExts.some(ext =>
      fileName.endsWith(ext.replace('*', ''))
    )

    if (!hasValidExt) {
      const errorMsg = `Invalid file type. Accepted formats: ${accept}`
      setValidationError(errorMsg)
      return false
    }

    return true
  }, [accept, maxSizeMB])

  const handleFileSelect = useCallback((file) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
    if (onFileSelect) {
      onFileSelect(file)
    }
  }, [validateFile, onFileSelect])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, handleFileSelect])

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, uploading])

  const handleUploadClick = useCallback(() => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile)
    }
  }, [selectedFile, onUpload])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const displayError = error || validationError

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 ease-in-out
          ${isDragging
            ? 'border-blue-500 bg-blue-900 bg-opacity-20'
            : 'border-gray-600 bg-gray-800 bg-opacity-30'
          }
          ${disabled || uploading
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-blue-400 hover:bg-gray-700 hover:bg-opacity-20'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label="File upload drop zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploading}
          aria-label="File input"
        />

        <div className="flex flex-col items-center text-center">
          {/* Upload icon */}
          <svg
            className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {selectedFile ? (
            <div className="text-white">
              <p className="font-semibold">{selectedFile.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="text-white font-medium mb-1">
                {isDragging ? 'Drop file here' : 'Click or drag file to upload'}
              </p>
              <p className="text-sm text-gray-400">
                Accepted formats: {accept}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: {maxSizeMB}MB
              </p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Processing... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-300">{displayError}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {selectedFile && !uploading && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUploadClick}
            disabled={!!validationError || disabled}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload File
          </button>
          <button
            onClick={handleClear}
            disabled={disabled}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      )}

      {/* Educational disclaimer */}
      <div className="mt-4 p-3 bg-yellow-900 bg-opacity-10 border border-yellow-700 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong className="text-yellow-500">Educational/Research Only:</strong> Data uploaded is for
          visualization and association modeling. Not for medical advice or treatment decisions.
        </p>
      </div>
    </div>
  )
}

UploadCard.propTypes = {
  accept: PropTypes.string,
  maxSizeMB: PropTypes.number,
  onFileSelect: PropTypes.func,
  onUpload: PropTypes.func,
  uploading: PropTypes.bool,
  progress: PropTypes.number,
  error: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool
}

export default UploadCard
