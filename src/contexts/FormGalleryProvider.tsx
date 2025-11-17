import React, { createContext, useContext, useState } from "react";
import { useLocation } from "wouter";

interface Slide {
  title: string;
  content: React.ReactNode;
  hasInternalNext?: boolean;
}

interface FormGalleryContextValue {
  slides: Slide[];
  currentIndex: number;
  completed: boolean[];
  slideData: Record<number, any>;
  goToSlide: (i: number) => void;
  next: (data?: any) => void;
}

const FormGalleryContext = createContext<FormGalleryContextValue | undefined>(
  undefined
);

export function useFormGallery() {
  const ctx = useContext(FormGalleryContext);
  if (!ctx) throw new Error("useFormGallery must be used within a FormGalleryProvider");
  return ctx;
}

interface ProviderProps {
  slides: Slide[];
  onFinish?: () => void;
  children: React.ReactNode;
}

export function FormGalleryProvider({ slides, onFinish, children }: ProviderProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(slides.map(() => false));
  const [slideData, setSlideData] = useState<Record<number, any>>({});

  const goToSlide = (i: number) => setCurrentIndex(i);

  const next = (data?: any) => {
    setCompleted((prev) => {
      const arr = [...prev];
      arr[currentIndex] = true;
      return arr;
    });
    if (data !== undefined) {
      setSlideData((prev) => ({ ...prev, [currentIndex]: data }));
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      setCurrentIndex(nextIndex);
    } else {
      onFinish ? onFinish() : setLocation("/");
    }
  };

  return (
    <FormGalleryContext.Provider
      value={{ slides, currentIndex, completed, slideData, goToSlide, next }}
    >
      {children}
    </FormGalleryContext.Provider>
  );
}

