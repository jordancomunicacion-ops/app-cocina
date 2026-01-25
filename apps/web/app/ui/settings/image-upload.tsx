'use client';

import { useState, useRef } from 'react';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
    currentImage?: string | null;
    onUpload: (formData: FormData) => Promise<{ success?: boolean; imageUrl?: string; error?: string }>;
    label: string;
    shape?: 'circle' | 'square';
    alt: string;
}

export default function ImageUpload({ currentImage, onUpload, label, shape = 'circle', alt }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await onUpload(formData);
            if (result.error) {
                alert(result.error);
                setPreview(currentImage || null); // Revert on error
            } else if (result.imageUrl) {
                setPreview(result.imageUrl);
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading image');
            setPreview(currentImage || null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div
                    className={`
            overflow-hidden border-4 border-white shadow-lg shrink-0 bg-gray-100 flex items-center justify-center
            ${shape === 'circle' ? 'rounded-full w-32 h-32' : 'rounded-lg w-full max-w-xs h-32'}
          `}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt={alt}
                            className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                        />
                    ) : (
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
                {isUploading ? 'Subiendo...' : label}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
