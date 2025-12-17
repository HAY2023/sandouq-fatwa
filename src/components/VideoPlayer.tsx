interface VideoPlayerProps {
  url: string;
  title: string;
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

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const youtubeId = isYouTubeUrl(url) ? getYouTubeVideoId(url) : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl mb-4 text-center text-foreground">{title}</h3>
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-card">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            className="w-full aspect-video"
            preload="metadata"
          >
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        )}
      </div>
    </div>
  );
}
