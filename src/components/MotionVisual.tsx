import { motion } from 'motion/react';
import { imageSrcset } from '../lib/optimized-media';

type MotionVisualProps = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function MotionVisual({
  src,
  alt,
  caption,
  width,
  height,
  className = '',
  loading = 'lazy',
}: MotionVisualProps) {
  return (
    <motion.figure
      className={`motion-visual ${className}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={src}
        srcSet={imageSrcset(src)}
        sizes="(min-width: 801px) 50vw, 100vw"
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
      <figcaption className="border-b rule py-3 text-xs text-[var(--color-ink-soft)]">
        {caption}
      </figcaption>
    </motion.figure>
  );
}
