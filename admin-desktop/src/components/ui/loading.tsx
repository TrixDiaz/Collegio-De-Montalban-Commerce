import { Loader2 } from "lucide-react"

interface LoadingProps {
  text?: string
  className?: string
}

export const Loading = ({ text = "Loading...", className }: LoadingProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}