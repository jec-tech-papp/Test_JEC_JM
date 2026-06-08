import { useState } from 'react';

interface PlantAvatarProps {
  photoUrl?: string | null;
  emoji?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-12 w-12 text-xl',
  md: 'h-16 w-16 text-2xl',
  lg: 'h-24 w-24 text-4xl',
  xl: 'h-48 w-full text-6xl',
};

export function PlantAvatar({
  photoUrl,
  emoji = '🌱',
  alt,
  size = 'md',
  className = '',
}: PlantAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = photoUrl && !failed;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-xl object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-100 to-leaf-200 ${sizes[size]} ${className}`}
      aria-hidden
    >
      <span>{emoji}</span>
    </div>
  );
}
