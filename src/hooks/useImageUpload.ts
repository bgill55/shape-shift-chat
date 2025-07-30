import { useState, useRef, useEffect } from 'react';

export function useImageUpload() {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentPreviewUrl = imagePreviewUrl;
    if (!selectedImageFile && currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      setImagePreviewUrl(null);
    }
    
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [selectedImageFile, imagePreviewUrl]);

  const handleImageUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(newPreviewUrl);
    } else {
      setSelectedImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
    }
    event.target.value = '';
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    selectedImageFile,
    imagePreviewUrl,
    fileInputRef,
    handleImageUploadButtonClick,
    handleFileSelected,
    handleRemoveSelectedImage,
  };
}