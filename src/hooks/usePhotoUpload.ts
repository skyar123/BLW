import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useFamily } from './useFamily';

export function usePhotoUpload() {
  const { familyId } = useFamily();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, path: string): Promise<string | null> => {
    if (!familyId) {
      setError('No family ID');
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create unique filename
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const fullPath = `families/${familyId}/${path}/${filename}`;

      const storageRef = ref(storage, fullPath);

      // Compress image if needed
      const compressedFile = await compressImage(file);

      setProgress(30);

      // Upload
      await uploadBytes(storageRef, compressedFile);
      setProgress(80);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      setProgress(100);

      return downloadURL;
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPhoto, uploading, progress, error };
}

async function compressImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
