// components/products/ProductImageGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImageGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full lg:w-[70%] rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={images[selectedImage]}
          alt="Product image"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-md overflow-hidden ${
                selectedImage === index
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100"
              } transition-opacity`}
            >
              <Image
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
