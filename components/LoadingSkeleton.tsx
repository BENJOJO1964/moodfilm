import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  type?: 'image' | 'text' | 'button';
}

export function LoadingSkeleton({ className, type = 'image' }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-muted";
  
  if (type === 'image') {
    return (
      <div className={cn(
        "w-full h-64 rounded-lg bg-muted animate-pulse",
        className
      )} />
    );
  }
  
  if (type === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className={cn("h-4 bg-muted rounded animate-pulse", baseClasses)} />
        <div className={cn("h-4 bg-muted rounded animate-pulse w-3/4", baseClasses)} />
        <div className={cn("h-4 bg-muted rounded animate-pulse w-1/2", baseClasses)} />
      </div>
    );
  }
  
  if (type === 'button') {
    return (
      <div className={cn(
        "h-10 w-20 rounded-md bg-muted animate-pulse",
        className
      )} />
    );
  }
  
  return (
    <div className={cn(
      "w-full h-32 rounded-lg bg-muted animate-pulse",
      className
    )} />
  );
}
