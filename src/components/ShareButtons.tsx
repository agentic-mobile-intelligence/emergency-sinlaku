import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  url?: string;
  title?: string;
}

export default function ShareButtons({
  url = window.location.href,
  title = 'Sinlaku Directory',
}: ShareButtonsProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast('Link copied!');
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => window.open(whatsappUrl, '_blank')}>
        WhatsApp
      </Button>
      <Button variant="outline" onClick={() => window.open(facebookUrl, '_blank')}>
        Facebook
      </Button>
      <Button variant="outline" onClick={handleCopyLink}>
        Copy Link
      </Button>
    </div>
  );
}
