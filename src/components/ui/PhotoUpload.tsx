import { useRef, useState } from 'react';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  path: string;
  className?: string;
}

export function PhotoUpload({ onUpload, currentUrl, path, className = '' }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, uploading, progress, error } = usePhotoUpload();
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase
    const url = await uploadPhoto(file, path);
    if (url) {
      onUpload(url);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className={`
          w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
          transition-colors
          ${preview ? 'border-sage-300 bg-sage-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full p-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm">{progress}%</div>
              </div>
            )}
          </div>
        ) : (
          <>
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-500">
              {uploading ? `Uploading... ${progress}%` : 'Add photo (optional)'}
            </span>
          </>
        )}
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
