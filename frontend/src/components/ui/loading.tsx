import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const Loading = ({ className, text, ...props }: React.ComponentProps<"div"> & { text?: string }) => {
    return (
        <div className={cn("flex justify-center items-center h-screen", className)} {...props}>
            <Loader2 className="animate-spin" />
            {text && <span className="ml-2">{text}</span>}
        </div>
    )
}

export { Loading }
