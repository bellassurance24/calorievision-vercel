import { memo, useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
}

/**
 * Optimized image component with lazy loading and blur-up effect.
 * Uses native lazy loading and IntersectionObserver for better performance.
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        backgroundColor: 'hsl(var(--muted))',
      }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/* Placeholder while loading */}
      {!isLoaded && placeholder && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
    </div>
  );
});

export default OptimizedImage;
