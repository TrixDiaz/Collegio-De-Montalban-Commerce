import React, { useRef } from 'react';
import { Button } from './button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    onFileSelect: (files: FileList | null) => void;
    onRemoveImage: (index: number) => void;
    previewImages: string[];
    selectedFiles: File[];
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onFileSelect,
    onRemoveImage,
    previewImages,
    selectedFiles,
    maxFiles = 10,
    multiple = true,
    disabled = false,
    isLoading = false,
    className
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        // Check file count limit
        if (selectedFiles.length + files.length > maxFiles) {
            return;
        }

        onFileSelect(files);
    };

    const handleClick = () => {
        if (disabled || isLoading) return;
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-wrap gap-2">
                {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-md border"
                            crossOrigin="anonymous"
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveImage(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                ))}

                {selectedFiles.length < maxFiles && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClick}
                        disabled={disabled || isLoading}
                        className="w-24 h-24 flex flex-col items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin mb-1" />
                        ) : (
                            <ImageIcon className="h-6 w-6 mb-1" />
                        )}
                        <span className="text-xs">
                            {isLoading ? 'Uploading...' : multiple ? 'Add Images' : 'Add Image'}
                        </span>
                    </Button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={disabled}
            />

            {selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {selectedFiles.length} of {maxFiles} files selected
                </p>
            )}
        </div>
    );
};

interface ThumbnailUploadProps {
    onFileSelect: (files: FileList | null) => void;
    onRemove: () => void;
    previewUrl: string | null;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
    onFileSelect,
    onRemove,
    previewUrl,
    disabled = false,
    isLoading = false,
    className
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        onFileSelect(files);
    };

    const handleClick = () => {
        if (disabled || isLoading) return;
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-4">
                {previewUrl ? (
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Thumbnail preview"
                            className="w-32 h-32 object-cover rounded-md border"
                            crossOrigin="anonymous"
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={onRemove}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClick}
                        disabled={disabled || isLoading}
                        className="w-32 h-32 flex flex-col items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        ) : (
                            <Upload className="h-8 w-8 mb-2" />
                        )}
                        <span className="text-xs">
                            {isLoading ? 'Uploading...' : 'Upload Thumbnail'}
                        </span>
                    </Button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={disabled}
            />
        </div>
    );
};
