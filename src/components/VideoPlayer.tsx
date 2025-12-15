interface VideoPlayerProps {
  url: string;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl mb-4 text-center text-foreground">{title}</h3>
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-card">
        <video
          src={url}
          controls
          className="w-full aspect-video"
          preload="metadata"
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>
    </div>
  );
}
