import { useState, useEffect, useRef } from "react";

export function SafeImage({ 
  src, 
  alt, 
  className, 
  loading: loadingAttr = "lazy" 
}: { 
  src: string; 
  alt?: string; 
  className?: string; 
  loading?: "lazy" | "eager"; 
}) {
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      <img 
        ref={(el) => {
          imgRef.current = el;
          if (el && el.complete && loading) {
            setLoading(false);
          }
        }}
        src={src} 
        alt={alt || "Scene Graphic"} 
        className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
        referrerPolicy="no-referrer"
        loading={loadingAttr}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading && (
        <div className="absolute inset-0 bg-[#0c0d12] animate-pulse flex items-center justify-center p-2">
          <div className="w-5 h-5 rounded-full border-2 border-amber-accent border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}


