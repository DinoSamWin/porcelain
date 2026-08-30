"use client";

import { ChevronLeft, ChevronRight, ImageUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/domain";

const carouselIntervalMs = 5000;
const swipeThreshold = 42;

interface HeroSlide {
  id: string;
  name: string;
  href: string;
  image: string;
  mobileImage: string;
  alt: string;
}

export function HomeHeroCarousel({
  products,
  fallbackImage,
  fallbackAlt = "Enamel porcelain product"
}: {
  products: Product[];
  fallbackImage: string;
  fallbackAlt?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slides = useMemo<HeroSlide[]>(() => {
    const productSlides = products
      .map((product) => {
        const image = product.bannerImage?.src || product.images[0]?.src;
        if (!image) return null;

        return {
          id: product.id,
          name: product.name,
          href: `/products/${product.slug}`,
          image,
          mobileImage: product.mobileBannerImage?.src || image,
          alt: product.bannerImage?.alt ?? product.images[0]?.alt ?? product.name
        };
      })
      .filter((slide): slide is HeroSlide => Boolean(slide));

    if (productSlides.length > 0) return productSlides;
    if (!fallbackImage) return [];

    return [
      {
        id: "fallback",
        name: fallbackAlt,
        href: "",
        image: fallbackImage,
        mobileImage: fallbackImage,
        alt: fallbackAlt
      }
    ];
  }, [fallbackAlt, fallbackImage, products]);

  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    if (!hasMultipleSlides) return;

    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, carouselIntervalMs);

    return () => window.clearTimeout(timer);
  }, [currentIndex, hasMultipleSlides, slides.length]);

  function goToSlide(index: number) {
    if (!hasMultipleSlides) return;
    setCurrentIndex((index + slides.length) % slides.length);
  }

  function goToPrevious() {
    goToSlide(currentIndex - 1);
  }

  function goToNext() {
    goToSlide(currentIndex + 1);
  }

  function handleTouchEnd(touchEndX: number) {
    if (touchStartX === null) return;

    const diff = touchStartX - touchEndX;
    setTouchStartX(null);
    if (Math.abs(diff) < swipeThreshold) return;

    if (diff > 0) {
      goToNext();
      return;
    }

    goToPrevious();
  }

  return (
    <section className="phase-hero" aria-label="Enamel porcelain showcase">
      {slides.length > 0 ? (
        <div
          className="phase-hero__media"
          onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            const slideMedia = (
              <>
                {slide.mobileImage !== slide.image ? (
                  <Image
                    src={slide.mobileImage}
                    alt={slide.alt}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    unoptimized
                    className="phase-hero__image phase-hero__image--mobile"
                    sizes="100vw"
                  />
                ) : null}
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized
                  className="phase-hero__image phase-hero__image--desktop"
                  sizes="100vw"
                />
              </>
            );

            if (slide.href) {
              return (
                <Link
                  aria-hidden={!isActive}
                  aria-label={`View ${slide.name}`}
                  className={isActive ? "phase-hero__slide is-active" : "phase-hero__slide"}
                  href={slide.href}
                  key={slide.id}
                  tabIndex={isActive ? 0 : -1}
                >
                  {slideMedia}
                </Link>
              );
            }

            return (
              <div aria-hidden={!isActive} className={isActive ? "phase-hero__slide is-active" : "phase-hero__slide"} key={slide.id}>
                {slideMedia}
              </div>
            );
          })}

          {hasMultipleSlides ? (
            <>
              <button className="phase-hero__arrow phase-hero__arrow--prev" type="button" aria-label="上一张 Banner" onClick={goToPrevious}>
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button className="phase-hero__arrow phase-hero__arrow--next" type="button" aria-label="下一张 Banner" onClick={goToNext}>
                <ChevronRight size={22} aria-hidden="true" />
              </button>
              <div className="phase-hero__indicators" aria-label="Banner 切换">
                {slides.map((slide, index) => (
                  <button
                    aria-label={`切换到 ${slide.name}`}
                    className={index === currentIndex ? "is-active" : ""}
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                  >
                    <span key={index === currentIndex ? `active-${currentIndex}` : `idle-${index}`} />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="phase-hero__empty">
          <ImageUp size={42} aria-hidden="true" />
          <span>Waiting for first product image</span>
        </div>
      )}

      <div className="phase-hero__copy">
        <div className="phase-hero__actions">
          <Link className="btn btn-primary" href="#featured">
            Explore
          </Link>
          <Link className="btn btn-secondary" href="/request-quote">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
