import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-2.5 md:px-20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}