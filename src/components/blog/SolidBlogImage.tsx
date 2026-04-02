/**
 * SolidBlogImage — v8-absolute
 *
 * The container is position:relative with a FIXED height of 220px.
 * The img is position:absolute with inset:0 — this forces it to fill
 * the container's EXACT 220×width box regardless of the image's natural
 * dimensions, Tailwind resets, or any CSS inheritance.
 *
 * clip-path on the container handles the 24px top rounded corners.
 * direction:ltr isolates from dir="rtl" ancestors (Arabic page).
 */

interface SolidBlogImageProps {
  src: string;
  alt: string;
}

export function SolidBlogImage({ src, alt }: SolidBlogImageProps) {
  return (
    <div
      data-blog-thumb="v8"
      style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        /* clip-path cuts the container's own paint to 24px top corners.
           Works even when overflow+border-radius fails due to transforms. */
        clipPath: 'inset(0 round 24px 24px 0 0)',
        overflow: 'hidden',
        borderRadius: '24px 24px 0 0',
        background: '#f3f4f6',
        display: 'block',
        flexShrink: 0,
        /* Isolate from dir="rtl" on the Arabic page */
        direction: 'ltr',
        unicodeBidi: 'isolate',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          /* absolute + inset:0 fills the container's exact 220px box.
             This cannot be overridden by height:auto from any CSS reset. */
          position: 'absolute',
          inset: 0,        /* physical shorthand: top=0 right=0 bottom=0 left=0 */
          top: 0,          /* explicit fallback for old browsers */
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          maxWidth: 'none',
          margin: 0,
          padding: 0,
          border: 'none',
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
