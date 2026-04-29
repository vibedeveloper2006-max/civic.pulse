import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

/**
 * Card component for structured information display.
 */
export function Card({ children, className, elevated }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded border border-[#c4c6d0]",
        elevated && "shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
Card.displayName = "Card";

/**
 * Header component for Card.
 */
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-b border-[#ebeef0]", className)}>{children}</div>;
}
CardHeader.displayName = "CardHeader";

/**
 * Layout container for content within a Card.
 */
export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
CardContent.displayName = "CardContent";

/**
 * Footer component for Card.
 */
export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-[#ebeef0] bg-[#f7fafc]", className)}>{children}</div>;
}
CardFooter.displayName = "CardFooter";
