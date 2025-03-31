import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle,  } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    title: string;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
    children,
    open,
    title,
    onOpenChange,
}:ResponsiveModalProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-dvh">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <DrawerFooter className="overflow-x-auto">
                        {children}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] overflow-x-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}