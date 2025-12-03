
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useElementSize } from "@/hooks/use-element-size";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ImageZoomProps {
  imageUrl: string;
  zoomLevel?: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function ImageZoom({ imageUrl, zoomLevel = 2 }: ImageZoomProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageRef, { width: imageWidth, height: imageHeight }] = useElementSize();
  const [containerRef, { width: containerWidth, height: containerHeight }] = useElementSize();
  const isMobile = useIsMobile();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imageRefMobile = useRef<HTMLImageElement>(null);
  const initialPinchDistance = useRef<number | null>(null);

  // Reset state when imageUrl changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    initialPinchDistance.current = null;
  }, [imageUrl]);
  
  if (isMobile) {
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance.current = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
      }
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentPinchDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const pinchRatio = currentPinchDistance / initialPinchDistance.current;
        const newScale = Math.max(MIN_SCALE, Math.min(scale * pinchRatio, MAX_SCALE));
        setScale(newScale);
      } else if (e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        const touch = e.touches[0];
        setOffset(currentOffset => {
            const newX = currentOffset.x + touch.clientX - (e.currentTarget.dataset.lastX ? parseFloat(e.currentTarget.dataset.lastX) : touch.clientX);
            const newY = currentOffset.y + touch.clientY - (e.currentTarget.dataset.lastY ? parseFloat(e.currentTarget.dataset.lastY) : touch.clientY);
            
            const maxOffsetX = (imageWidth * scale - containerWidth) / 2 / scale;
            const maxOffsetY = (imageHeight * scale - containerHeight) / 2 / scale;
            
            return {
              x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
              y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
            };
        });
        e.currentTarget.dataset.lastX = touch.clientX.toString();
        e.currentTarget.dataset.lastY = touch.clientY.toString();
      }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      initialPinchDistance.current = null;
      delete e.currentTarget.dataset.lastX;
      delete e.currentTarget.dataset.lastY;
    };
    
    return (
        <div
            className="relative w-full h-full overflow-hidden touch-none flex items-center justify-center"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Image
                ref={imageRefMobile}
                src={imageUrl}
                alt="Product image"
                fill
                className="object-contain transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
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
            "absolute left-full top-0 z-10 ml-4 w-full h-full border bg-white overflow-hidden pointer-events-none transition-opacity duration-300",
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
