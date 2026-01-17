import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogHeaderProps {
    children: React.ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
            />
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    );
};

const DialogContent = ({ className, children }: DialogContentProps) => {
    return (
        <div
            className={cn(
                "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
                className
            )}
        >
            {children}
        </div>
    );
};

const DialogHeader = ({ children }: DialogHeaderProps) => {
    return (
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            {children}
        </div>
    );
};

const DialogTitle = ({ className, children }: DialogTitleProps) => {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    );
};

const DialogClose = ({
    onClose,
}: {
    onClose: () => void;
}) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={onClose}
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </Button>
    );
};

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
};

