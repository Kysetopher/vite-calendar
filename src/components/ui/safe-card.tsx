// Safe Card component without circular dependencies
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl bg-white/30 backdrop-blur-lg text-card-foreground shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const CardContent = ({ className, children, ...props }: CardContentProps) => (
  <div className={cn("p-6 h-full", className)} {...props}>
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ className, children, ...props }: CardTitleProps) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export const CardDescription = ({ className, children, ...props }: CardDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);