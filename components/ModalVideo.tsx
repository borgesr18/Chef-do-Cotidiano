//components/ModalVideo.tsx
import { useState } from "react";

export default function ModalVideo({ videoUrl }: { videoUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="bg-black text-white px-4 py-2 rounded">
        Assistir Vídeo
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-2xl w-full">
            <button onClick={() => setOpen(false)} className="text-black mb-2">Fechar</button>
            <iframe
              src={videoUrl}
              width="100%"
              height="400"
              allow="autoplay; encrypted-media"
              title="Vídeo"
            />
          </div>
        </div>
      )}
    </div>
  );
}
