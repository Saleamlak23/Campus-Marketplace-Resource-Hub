import { useRef, useState } from 'react';
import Spinner from '../common/Spinner';
import { uploadListingImage, validateImageFile } from '../../lib/cloudinary';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`You can upload up to ${maxImages} images.`);
      return;
    }

    const files = Array.from(fileList).slice(0, remainingSlots);
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(undefined);
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        // Sequential to keep upload order stable and avoid overwhelming the API.
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadListingImage(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch {
      setError('One or more images failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text">
        Photos ({images.length}/{maxImages})
      </label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            <img
              src={url}
              alt={`Listing photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove photo ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface-muted text-text-muted transition-colors hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFilesSelected(event.target.files);
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs text-danger-600" role="alert">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-xs text-text-muted">
        JPG, PNG, or WEBP. Up to 5MB each.
      </p>
    </div>
  );
}
