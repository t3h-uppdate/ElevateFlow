import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default: "bg-black text-white hover:bg-black/90",
      destructive: "bg-red-500 text-white hover:bg-red-500/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    };
    
    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.default} h-10 px-4 py-2 ${className}`} {...props} />
    )
  }
)
Button.displayName = "Button"
export { Button }