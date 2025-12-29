import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { Video } from '@/hooks/useVideos';

interface SortableVideoItemProps {
  video: Video;
  onDelete: (videoId: string) => void;
}

export function SortableVideoItem({ video, onDelete }: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{video.title}</h4>
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary hover:underline truncate block"
          >
            {video.url}
          </a>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(video.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
