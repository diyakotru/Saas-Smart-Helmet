import * as React from "react"
import { cn } from "../lib/utils" // Adjust path if needed

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder-gray-400 selection:bg-blue-500 selection:text-white bg-white border border-gray-300 h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
