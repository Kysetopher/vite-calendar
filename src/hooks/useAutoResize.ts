import { useEffect, useRef } from 'react';

// Auto-resize function
const useAutoResize = (value: any) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return textareaRef;
};

export default useAutoResize;