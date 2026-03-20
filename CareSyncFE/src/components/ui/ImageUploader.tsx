// src/components/ui/ImageUploader.tsx

import { useState, useRef, useCallback } from 'react';
import { uploadApi } from '../../api/upload.api';
import { cn } from '../../utils/cn';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImageUploaderProps {
  folder: 'users' | 'patients' | 'medications' | 'prescriptions' | 'administration-proof';
  fileName: string;
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  optional?: boolean;
  hint?: string;
}

export function ImageUploader({
  folder,
  fileName,
  label,
  value,
  onChange,
  optional = true,
  hint,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState('');
  const [preview, setPreview]         = useState<string | null>(value ?? null);
  const [isDragging, setIsDragging]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Use JPG, PNG, GIF, or WEBP.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Max size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsUploading(true);
    setProgress(0);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate progress (real progress needs XHR, not axios easily)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85));
    }, 200);

    try {
      const url = await uploadApi.uploadImage(file, folder, fileName);
      clearInterval(interval);
      setProgress(100);
      onChange(url);
      setPreview(url);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(null);
      onChange(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [folder, fileName, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    onChange(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {optional && (
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1.5 py-0.5
                           bg-gray-100 dark:bg-gray-700 rounded-md">
            Optional
          </span>
        )}
      </div>

      {/* Preview state */}
      {preview ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50
                        border border-gray-200 dark:border-gray-600 rounded-xl">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0
                          bg-gray-200 dark:bg-gray-600">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
              {isUploading ? 'Uploading...' : 'Uploaded successfully'}
            </p>
            {isUploading && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{progress}%</p>
              </div>
            )}
            {!isUploading && (
              <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">
                ✅ Ready to use
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium
                         hover:underline disabled:opacity-50"
            >
              Change
            </button>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-xs text-error-600 dark:text-error-400 font-medium
                         hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-6',
            'border-2 border-dashed rounded-xl cursor-pointer transition-all',
            isDragging
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {isUploading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-primary-200 dark:border-primary-800
                              border-t-primary-500 animate-spin" />
              <div className="w-full max-w-[200px]">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
                  Uploading... {progress}%
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700
                              flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-primary-600 dark:text-primary-400">Click to upload</span>
                  {' '}or drag & drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  JPG, PNG, GIF, WEBP · Max {MAX_SIZE_MB}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-error-600 dark:text-error-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}