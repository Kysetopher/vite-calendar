// Complete safe UI components to replace shadcn/ui components
import { cn } from "@/lib/utils";
import * as React from "react";
import { forwardRef } from "react";
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from "react-hook-form";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

// Card Components
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col border-border space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-[#275559] text-primary-foreground hover:bg-accent",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          checked ? "bg-primary" : "bg-input",
          className
        )}>
          <span className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-6" : "translate-x-1"
          )} />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

// Select Components
interface SelectContextValue {
  value?: string
  label?: React.ReactNode
  setValue: (value: string, label: React.ReactNode) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  defaultValue?: string
}

export const Select = ({ value, onValueChange, children, defaultValue }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [label, setLabel] = React.useState<React.ReactNode>()
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const currentValue = value ?? internalValue

  const handleChange = (val: string, lbl: React.ReactNode) => {
    onValueChange?.(val)
    if (value === undefined) {
      setInternalValue(val)
    }
    setLabel(lbl)
    setOpen(false)
  }

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <SelectContext.Provider value={{ value: currentValue, label, setValue: handleChange, open, setOpen }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)!
    return (
      <Button
        type="button"
        ref={ref}
        onClick={() => ctx.setOpen(!ctx.open)}
        className={cn(
          "flex h-10 text-muted-foreground w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(SelectContext)!
  return (
    <span className={cn(!ctx.label && "text-muted-foreground capitalize")}>{ctx.label || ctx.value || placeholder}</span>
  )
}

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const ctx = React.useContext(SelectContext)!
  if (!ctx.open) return null
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-white p-1 shadow-md">
      {children}
    </div>
  )
}

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const ctx = React.useContext(SelectContext)!
  return (
    <div
      onClick={() => ctx.setValue(value, children)}
      className="relative text-muted-foreground flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </div>
  )
}

// Form Components (simplified)
export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export const FormItem = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-2", className)}>{children}</div>
);

export const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
    {children}
  </label>
);

export const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const FormDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);

export const FormMessage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm font-medium text-destructive", className)}>{children}</p>
);
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  render,
}: {
  control?: Control<TFieldValues>;
  name: TName;
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactNode;
}) {
  const ctx = useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | undefined;
  return (
    <Controller
      control={(control ?? ctx?.control) as Control<TFieldValues>}
      name={name}
      render={render}
    />
  );
}
