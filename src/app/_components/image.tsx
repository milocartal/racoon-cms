"use client";

import Image, { type ImageLoader } from "next/image";
import { useState } from "react";

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loader?: ImageLoader;
  fallback?: string;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt,
  loader,
  width = 500,
  height = 500,
  className,
  fallback = "/assets/indisponible.svg",
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      loader={loader}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc(fallback)} // chemin de l'image de fallback
    />
  );
};

export default CustomImage;
