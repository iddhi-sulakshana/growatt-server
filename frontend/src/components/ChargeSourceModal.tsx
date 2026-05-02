import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { getChargeSourceService, useSetChargeSource } from "@/service/growatt";
import { Loader2, Sun, SunMedium, Zap } from "lucide-react";
import { useChargeSourceModalStore } from "@/lib/ChargeSourceModalStore";

const CHARGE_SOURCE_OPTIONS = [
    {
        value: 0,
        label: "Solar First",
        description: "Prioritise solar; use utility when solar is insufficient",
        Icon: Sun,
    },
    {
        value: 1,
        label: "Solar and Utility",
        description: "Charge from both solar and utility simultaneously",
        Icon: SunMedium,
    },
    {
        value: 2,
        label: "Only Solar",
        description: "Charge only from solar power",
        Icon: Zap,
    },
] as const;

const ChargeSourceModal = () => {
    const isOpen = useChargeSourceModalStore((state) => state.isOpen);
    const closeModal = useChargeSourceModalStore((state) => state.closeModal);
    const setChargeSource = useSetChargeSource();
    const [isSetting, setIsSetting] = useState(false);
    const { data, refetch } = getChargeSourceService();
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    // Silently refetch when modal opens; keep showing last known value
    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    // Sync from server data whenever it arrives (background confirmation)
    useEffect(() => {
        if (data?.data?.value !== undefined) {
            setCurrentValue(data.data.value);
        }
    }, [data?.data?.value]);

    const handleSetValue = async (value: number) => {
        const previousValue = currentValue;
        setCurrentValue(value); // optimistic update
        setIsSetting(true);
        try {
            await setChargeSource.mutateAsync(value);
            closeModal();
        } catch {
            setCurrentValue(previousValue); // revert on error
        } finally {
            setIsSetting(false);
        }
    };

    const isDisabled = isSetting || setChargeSource.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md">
                <DialogClose onClose={closeModal} />
                <DialogHeader>
                    <DialogTitle>Set Charge Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {currentValue !== null && (
                        <div className="text-center text-sm text-muted-foreground">
                            Current value:{" "}
                            <strong>
                                {CHARGE_SOURCE_OPTIONS.find((o) => o.value === currentValue)?.label}{" "}
                                ({currentValue})
                            </strong>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Choose the source used to charge the battery.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {CHARGE_SOURCE_OPTIONS.map(({ value, label, description, Icon }) => {
                            const isActive = currentValue === value;
                            return (
                                <Button
                                    key={value}
                                    onClick={() => handleSetValue(value)}
                                    disabled={isDisabled}
                                    variant={isActive ? "default" : "outline"}
                                    className="h-auto py-3 px-4 flex flex-col items-start justify-start gap-1 hover:bg-accent text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-normal pl-6">
                                        {description}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                    {isDisabled && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Setting...
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChargeSourceModal;
