import { useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Icon from './ui/Icon'

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
    <div className="glass-panel rounded-card p-card-padding">
      <div className="mb-4">
        <h3 className="font-headline-md text-base text-on-surface">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>
      </div>

      {/* Drop zone */}
      <div
        className={`
          relative rounded-card border border-dashed p-6 sm:p-8
          transition-all duration-200 ease-in-out
          ${isDragging
            ? 'border-secondary bg-secondary/[0.08]'
            : 'border-outline-variant bg-white/[0.02]'
          }
          ${disabled || uploading
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-cytosine-azure/50 hover:bg-white/[0.05]'
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
          <Icon
            name={selectedFile ? 'draft' : 'cloud_upload'}
            size={40}
            className={`mb-3 ${
              isDragging
                ? 'text-secondary'
                : selectedFile
                  ? 'text-cytosine-azure'
                  : 'text-on-surface-variant/60'
            }`}
          />

          {selectedFile ? (
            <div className="min-w-0">
              <p className="break-all text-sm text-on-surface">{selectedFile.name}</p>
              <p className="mt-1 font-code-mono text-xs text-on-surface-variant">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="mb-1 text-sm text-on-surface">
                {isDragging ? 'Drop file here' : 'Click or drag a file to upload'}
              </p>
              <p className="font-code-mono text-xs text-on-surface-variant">
                Accepts {accept}
              </p>
              <p className="mt-1 font-code-mono text-[11px] text-on-surface-variant/60">
                Max {maxSizeMB} MB
              </p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mt-4">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-2 text-center font-code-mono text-xs text-on-surface-variant">
              Processing… {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="mt-4 rounded-lg border border-error/40 bg-error/10 p-3">
          <div className="flex items-start gap-2">
            <Icon name="error" size={18} className="mt-0.5 shrink-0 text-error" />
            <p className="text-sm leading-relaxed text-error">{displayError}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {selectedFile && !uploading && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={!!validationError || disabled}
            className="btn-primary btn-scan flex-1"
          >
            <Icon name="upload" size={18} />
            Upload file
          </button>
          <button type="button" onClick={handleClear} disabled={disabled} className="btn-ghost">
            Clear
          </button>
        </div>
      )}

      {/* Educational disclaimer */}
      <div className="mt-4 rounded-lg border border-glass-border bg-white/[0.02] p-3">
        <p className="font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
          <strong className="text-guanine-amber">Educational / research only:</strong> uploaded data
          is used for visualization and association modeling — not for medical advice or treatment
          decisions.
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
