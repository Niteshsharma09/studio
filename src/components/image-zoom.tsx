
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useElementSize } from "@/hooks/use-element-size";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ImageZoomProps {
  imageUrl: string;
  zoomLevel?: number;
}

export function ImageZoom({ imageUrl, zoomLevel = 2 }: ImageZoomProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [imageRef, { width: imageWidth, height: imageHeight }] = useElementSize();
  const [containerRef, { width: containerWidth, height: containerHeight }] = useElementSize();

  const isMobile = useIsMobile();

  if (isMobile) {
    // On mobile, we use a simple pinch-to-zoom container.
    // This is a basic implementation; a more robust library could be used for a better experience.
    return (
        <div className="relative w-full h-full overflow-hidden">
            <Image
                src={imageUrl}
                alt="Product image"
                fill
                className="object-contain rounded-lg"
                sizes="100vw"
                priority
            />
        </div>
    );
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    setPosition({ x, y });

    if (x < 0 || x > width || y < 0 || y > height) {
      setShowZoom(false);
    } else {
      setShowZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };
  
  const lensSize = {
      width: containerWidth / zoomLevel,
      height: containerHeight / zoomLevel,
  }

  const lensPosition = {
    x: position.x - lensSize.width / 2,
    y: position.y - lensSize.height / 2,
  };

  const backgroundPosition = {
    x: -lensPosition.x * zoomLevel,
    y: -lensPosition.y * zoomLevel,
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div
        className="relative w-full h-full cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          ref={imageRef}
          src={imageUrl}
          alt="Product to zoom"
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {showZoom && (
          <div
            className="absolute bg-white/30 border border-gray-400 pointer-events-none"
            style={{
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              width: `${lensSize.width}px`,
              height: `${lensSize.height}px`,
            }}
          />
        )}
      </div>

      <div
        className={cn(
            "absolute left-full top-0 ml-4 z-10 w-full h-full border bg-white overflow-hidden pointer-events-none transition-opacity duration-300",
            // Hide on smaller screens where there's no room for the zoom pane
            "hidden lg:block"
        )}
        style={{
          opacity: showZoom ? 1 : 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${imageWidth * zoomLevel}px ${imageHeight * zoomLevel}px`,
          backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px`,
        }}
      />
    </div>
  );
}
