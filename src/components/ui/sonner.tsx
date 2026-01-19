import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    error: "group-[.toast]:bg-red-50 dark:group-[.toast]:bg-red-950 group-[.toast]:border-red-200 dark:group-[.toast]:border-red-800 group-[.toast]:text-red-900 dark:group-[.toast]:text-red-100",
                    success: "group-[.toast]:bg-green-50 dark:group-[.toast]:bg-green-950 group-[.toast]:border-green-200 dark:group-[.toast]:border-green-800 group-[.toast]:text-green-900 dark:group-[.toast]:text-green-100",
                    warning: "group-[.toast]:bg-yellow-50 dark:group-[.toast]:bg-yellow-950 group-[.toast]:border-yellow-200 dark:group-[.toast]:border-yellow-800 group-[.toast]:text-yellow-900 dark:group-[.toast]:text-yellow-100",
                    info: "group-[.toast]:bg-blue-50 dark:group-[.toast]:bg-blue-950 group-[.toast]:border-blue-200 dark:group-[.toast]:border-blue-800 group-[.toast]:text-blue-900 dark:group-[.toast]:text-blue-100",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
