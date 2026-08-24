import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90 contrast:border-2 contrast:border-black contrast:bg-primary contrast:text-primary-foreground contrast:hover:bg-yellow-300",
        outline:
          "border-foreground/50 bg-transparent text-foreground hover:bg-foreground/5 aria-expanded:bg-foreground/5 contrast:border-2 contrast:border-white",
        secondary:
          "bg-foreground/5 text-foreground hover:bg-foreground/10 contrast:border-2 contrast:border-white",
        ghost:
          "text-foreground/70 hover:bg-transparent hover:text-foreground aria-expanded:text-foreground contrast:text-white",
        destructive:
          "border-destructive bg-destructive text-white hover:brightness-95",
        link: "text-foreground underline decoration-1 underline-offset-4 hover:text-foreground",
      },
      size: {
        default:
          "h-11 min-h-11 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-11 min-h-11 gap-1 px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-11 min-h-11 gap-1 px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 min-h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11 min-h-11 min-w-11",
        "icon-xs":
          "size-11 min-h-11 min-w-11 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-sm":
          "size-11 min-h-11 min-w-11 in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12 min-h-12 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants };
