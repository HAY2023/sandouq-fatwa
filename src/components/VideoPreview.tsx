import { useState } from 'react';
import { Play, X, CheckCircle, AlertCircle, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPreviewProps {
  url: string;
  onValidated?: (isValid: boolean) => void;
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Extract Google Drive file ID from various URL formats
function getGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/\n?#]+)/,
    /drive\.google\.com\/open\?id=([^&\n?#]+)/,
    /drive\.google\.com\/uc\?.*id=([^&\n?#]+)/,
    /docs\.google\.com\/file\/d\/([^/\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com/file');
}

export function VideoPreview({ url, onValidated }: VideoPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const youtubeId = isYouTubeUrl(url) ? getYouTubeVideoId(url) : null;
  const driveId = isGoogleDriveUrl(url) ? getGoogleDriveFileId(url) : null;

  const handlePreview = () => {
    if (!url) return;
    setIsLoading(true);
    setShowPreview(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setIsValid(true);
    onValidated?.(true);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsValid(false);
    onValidated?.(false);
  };

  const closePreview = () => {
    setShowPreview(false);
    setIsLoading(false);
  };

  if (!url) {
    return null;
  }

  const getVideoType = () => {
    if (youtubeId) return 'YouTube';
    if (driveId) return 'Google Drive';
    return 'فيديو مباشر';
  };

  return (
    <div className="space-y-3">
      {/* زر المعاينة وحالة الرابط */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={!url}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          معاينة الفيديو
        </Button>
        
        {/* نوع الرابط */}
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
          <Video className="w-3 h-3 inline mr-1" />
          {getVideoType()}
        </span>
        
        {/* حالة الصلاحية */}
        {isValid === true && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            رابط صالح
          </span>
        )}
        {isValid === false && (
          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            رابط غير صالح
          </span>
        )}
      </div>

      {/* نافذة المعاينة */}
      {showPreview && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-black/90">
          {/* زر الإغلاق */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closePreview}
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* مؤشر التحميل */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-5">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* الفيديو */}
          <div className="aspect-video">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : driveId ? (
              <iframe
                src={`https://drive.google.com/file/d/${driveId}/preview`}
                title="Video Preview"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <video
                src={url}
                controls
                className="w-full h-full"
                preload="metadata"
                onLoadedMetadata={handleLoad}
                onError={handleError}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}