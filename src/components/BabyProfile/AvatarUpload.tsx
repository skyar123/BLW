import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useFamily } from '../../hooks/useFamily';

interface AvatarUploadProps {
  babyId: string;
  currentPhotoUrl?: string;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({
  babyId,
  currentPhotoUrl,
  onUploadComplete,
  size = 'lg',
}: AvatarUploadProps) {
  const { familyId } = useFamily();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Max dimensions
        const MAX_SIZE = 500;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !familyId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Compress the image
      const compressedBlob = await compressImage(file);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `families/${familyId}/babies/${babyId}/avatar.jpg`);
      await uploadBytes(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      onUploadComplete(downloadUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`
          ${sizeClasses[size]} rounded-full bg-sage-100 dark:bg-gray-700
          flex items-center justify-center overflow-hidden
          border-2 border-sage-200 dark:border-gray-600
          hover:border-sage-400 dark:hover:border-sage-500
          transition-all cursor-pointer relative group
          ${uploading ? 'opacity-50' : ''}
        `}
      >
        {currentPhotoUrl ? (
          <>
            <img
              src={currentPhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </>
        ) : (
          <span className={iconSizes[size]}>
            {uploading ? '...' : '👶'}
          </span>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
            <div className="w-6 h-6 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {currentPhotoUrl ? 'Tap to change photo' : 'Tap to add photo'}
      </p>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
