"use client";

import { useState } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage?: string;
  title?: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage, title }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!afterImage) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden">
        <Image
          src={beforeImage}
          alt={title || "Before"}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-white font-semibold">Before</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden cursor-col-resize group">
      {/* After Image */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={title ? `${title} - After` : "After"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Before Image with Clip */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={title ? `${title} - Before` : "Before"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-gray-400"></div>
            <div className="w-1 h-4 bg-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
        After
      </div>

      {/* Invisible Slider for Mouse/Touch */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
      />
    </div>
  );
}








