import * as React from "react"
import { cn } from "@/lib/utils"
import { GradientCard } from "./gradient-card"

const StatCard = React.forwardRef(({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  className,
  ...props
}, ref) => {
  return (
    <GradientCard
      ref={ref}
      className={cn("p-6 hover:border-primary/30 transition-all", className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold gradient-text">
          {value ?? "—"}
        </p>
        {trend && (
          <div className="flex items-center gap-1">
            {trendUp ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <p className={cn(
              "text-xs font-medium",
              trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {trend}
            </p>
          </div>
        )}
      </div>
    </GradientCard>
  )
})
StatCard.displayName = "StatCard"

export { StatCard }
