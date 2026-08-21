"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useState, type MouseEvent } from "react";
import type { ProductImage } from "@/types/domain";

export function ProductImageViewer({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
    setZoomed(true);
  }

  if (!activeImage) {
    return null;
  }

  return (
    <div className="product-gallery">
      <div
        className={zoomed ? "product-gallery__main is-zooming" : "product-gallery__main"}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={activeImage.src}
          alt={activeImage.alt || productName}
          fill
          loading="eager"
          unoptimized
          sizes="(max-width: 900px) 100vw, 54vw"
          style={{ transformOrigin: zoomOrigin }}
        />
        <button className="product-gallery__zoom" type="button" onClick={() => setLightboxOpen(true)}>
          <Maximize2 size={18} aria-hidden="true" />
          <span className="sr-only">View large image</span>
        </button>
      </div>

      {images.length > 1 ? (
        <div className="product-gallery__thumbs">
          {images.map((image, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
            >
              <Image src={image.src} alt={image.alt || productName} fill unoptimized sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div className="product-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Product image preview">
          <button className="product-gallery-lightbox__backdrop" type="button" aria-label="Close preview" onClick={() => setLightboxOpen(false)} />
          <div className="product-gallery-lightbox__panel">
            <button className="product-gallery-lightbox__close" type="button" onClick={() => setLightboxOpen(false)}>
              <X size={18} aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
            <Image src={activeImage.src} alt={activeImage.alt || productName} fill unoptimized sizes="92vw" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
