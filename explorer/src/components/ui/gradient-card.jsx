import * as React from "react"
import { cn } from "@/lib/utils"

const GradientCard = React.forwardRef(({ className, children, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40",
    glass: "glass dark:glass-dark",
    solid: "bg-card",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/20 dark:border-white/10",
        "backdrop-blur-lg shadow-xl transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.01]",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-fb-purple/10 to-fb-orange/10 opacity-50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
})
GradientCard.displayName = "GradientCard"

export { GradientCard }
