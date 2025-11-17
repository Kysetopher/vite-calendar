import {RefObject, TouchEvent, useEffect, useRef, useState} from "react";

interface UseSwipeConfig {
    minSwipeDistance?: number;
    animationDuration?: number;
}

export const useSwipe = (
    containerRef: RefObject<HTMLElement>,
    onSwipeLeft: () => void,
    onSwipeRight: () => void,
    config?: UseSwipeConfig
) => {
    const { minSwipeDistance = 100, animationDuration = 300 } = config || {};

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const touchCurrentX = useRef<number>(0);
    const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);
    const initialTouchY = useRef<number>(0);
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const isDragging = useRef(false);


    const handleTouchStart = (e: TouchEvent) => {
    if (isAnimating) return; // ignore if already animating
    touchStartX.current = e.touches[0].clientX;
    initialTouchY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = true; // set dragging state
    swipeDirection.current = null;
  };

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.current || isAnimating) return;
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  // determine swipe direction
  if (swipeDirection.current === null) {
    const deltaX = Math.abs(currentX - touchStartX.current);
    const deltaY = Math.abs(currentY - initialTouchY.current);
    // only set direction once user moves more than px in either direction
    if (deltaX > 100 || deltaY > 100) {
      swipeDirection.current = deltaX > deltaY ? 'horizontal' : 'vertical';
    }
  }
  // horizontal swipe only
  if (swipeDirection.current !== 'horizontal') return;
  touchCurrentX.current = e.touches[0].clientX;
  const diff = touchCurrentX.current - touchStartX.current;
  setTranslateX(diff)
};

const handleTouchEnd = () => {
    if (!isDragging.current || isAnimating) return;
    isDragging.current = false;

    const swipeDistance = touchCurrentX.current - touchStartX.current;
    const absSwipeDistance = Math.abs(swipeDistance);

    if (absSwipeDistance > minSwipeDistance) {
      // Sufficient swipe distance - complete the navigation
      setIsAnimating(true);

      if (swipeDistance > 0) {
        // Swiped right - go to previous day
        setTranslateX(window.innerWidth);
        setTimeout(() => {
          onSwipeRight();
          setTranslateX(0);
          setIsAnimating(false);
        }, animationDuration);
      } else {
        // Swiped left - go to next day
        setTranslateX(-window.innerWidth);
        setTimeout(() => {
          onSwipeLeft();
          setTranslateX(0);
          setIsAnimating(false);
        }, animationDuration);
      }
    } else {
      // Insufficient swipe - spring back
      setIsAnimating(true);
      setTranslateX(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
    }
  };

// Prevent default touch behavior on the container
  const handleTouchMovePassive = (e: TouchEvent) => {
    if (isDragging.current && Math.abs(translateX) > 5) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchmove', handleTouchMovePassive, { passive: false });
      return () => {
        container.removeEventListener('touchmove', handleTouchMovePassive);
      };
    }
  }, [containerRef]);

  const touchHandlers = {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
  }

  const swipeStyle = {
      transform: `translateX(calc(-100% + ${translateX}px))`,
      transition: isAnimating ? `transform ${animationDuration}ms ease-out` : 'none',
      willChange: isDragging.current ? 'transform' : 'auto'
  };

  return { touchHandlers, swipeStyle }
}