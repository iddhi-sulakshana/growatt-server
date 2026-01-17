import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    getMaxChargeCurrentService,
    useSetMaxChargeCurrent,
} from "@/service/growatt";
import { Loader2 } from "lucide-react";
import { useBatteryModalStore } from "@/lib/BatteryModalStore";

const CHARGE_VALUES = [1, 5, 10, 15, 20, 25, 30, 100];

const BatteryMaxChargeModal = () => {
    const isOpen = useBatteryModalStore((state) => state.isOpen);
    const closeModal = useBatteryModalStore((state) => state.closeModal);
    const { data, isLoading, refetch } = getMaxChargeCurrentService();
    const setMaxChargeCurrent = useSetMaxChargeCurrent();
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [isSetting, setIsSetting] = useState(false);
    const [customValue, setCustomValue] = useState<string>("");

    // Refetch when modal opens
    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    // Update current value when data changes
    useEffect(() => {
        if (data?.data?.value !== undefined) {
            setCurrentValue(data.data.value);
        }
    }, [data]);

    const handleSetValue = async (value: number) => {
        setIsSetting(true);
        try {
            await setMaxChargeCurrent.mutateAsync(value);
            // Refetch to get updated value
            await refetch();
            // Close modal after successful set
            closeModal();
        } catch (error) {
            // Error is handled by the mutation's onError
        } finally {
            setIsSetting(false);
        }
    };

    const handleCustomValue = async () => {
        const numValue = parseInt(customValue, 10);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return;
        }
        setCustomValue("");
        await handleSetValue(numValue);
    };

    const isDisabled = isSetting || setMaxChargeCurrent.isPending;
    const isCustomValueValid =
        customValue !== "" &&
        !isNaN(parseInt(customValue, 10)) &&
        parseInt(customValue, 10) >= 0 &&
        parseInt(customValue, 10) <= 100;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md">
                <DialogClose onClose={closeModal} />
                <DialogHeader>
                    <DialogTitle>Set Battery Charging Max</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {currentValue !== null && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Current value:{" "}
                                    <strong>{currentValue}</strong>
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                {CHARGE_VALUES.map((value) => {
                                    const isActive = currentValue === value;
                                    return (
                                        <Button
                                            key={value}
                                            onClick={() =>
                                                handleSetValue(value)
                                            }
                                            disabled={isDisabled}
                                            variant={
                                                isActive ? "default" : "outline"
                                            }
                                            className={`h-12 sm:h-14 text-sm sm:text-base font-semibold transition-colors ${
                                                isActive
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "hover:bg-accent"
                                            }`}
                                        >
                                            {value}
                                        </Button>
                                    );
                                })}
                            </div>
                            {isDisabled && (
                                <div className="flex items-center justify-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting value...
                                </div>
                            )}
                            <div className="pt-4 border-t">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Enter custom value (0-100)"
                                        value={customValue}
                                        onChange={(e) =>
                                            setCustomValue(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                isCustomValueValid
                                            ) {
                                                handleCustomValue();
                                            }
                                        }}
                                        disabled={isDisabled}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleCustomValue}
                                        disabled={
                                            isDisabled || !isCustomValueValid
                                        }
                                        className="sm:w-auto w-full"
                                    >
                                        Set Custom
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BatteryMaxChargeModal;
