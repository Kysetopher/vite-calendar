// Safe useToast hook without circular dependencies
import { useState } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = (toastCount++).toString();
    const newToast = { id, title, description, variant };
    
    // Simple console log for development
    console.log(`Toast: ${title || description}`);
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
    
    return id;
  };

  return {
    toasts,
    toast,
    dismiss: (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }
  };
}