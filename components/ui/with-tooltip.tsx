import React, { forwardRef } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip"

interface WithTooltipProps {
  display: React.ReactNode
  trigger: React.ReactNode
  delayDuration?: number
  side?: "left" | "right" | "top" | "bottom"
}

export const WithTooltip = forwardRef<HTMLButtonElement, WithTooltipProps>(
  ({ display, trigger, delayDuration = 500, side = "right" }, ref) => {
    return (
      <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
          <TooltipTrigger ref={ref}>{trigger}</TooltipTrigger>
          <TooltipContent side={side}>{display}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)

WithTooltip.displayName = "WithTooltip"
