import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
    getAcOutputSourceService,
    useSetAcOutputSource,
} from "@/service/growatt";
import {
    Loader2,
    BatteryCharging,
    SunMedium,
    PlugZap,
    Shuffle,
} from "lucide-react";
import { useInverterModalStore } from "@/lib/InverterModalStore";

const AC_OUTPUT_OPTIONS = [
    { value: 0, label: "SBU Priority", Icon: BatteryCharging },
    { value: 1, label: "Solar First", Icon: SunMedium },
    { value: 2, label: "Utility First", Icon: PlugZap },
    { value: 3, label: "SUB Priority", Icon: Shuffle },
] as const;

const AcOutputSourceModal = () => {
    const isOpen = useInverterModalStore((state) => state.isOpen);
    const closeModal = useInverterModalStore((state) => state.closeModal);
    const setAcOutputSource = useSetAcOutputSource();
    const [isSetting, setIsSetting] = useState(false);
    const { data, isLoading, refetch } = getAcOutputSourceService();
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [pendingValue, setPendingValue] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    useEffect(() => {
        if (data?.data?.value !== undefined) {
            setCurrentValue(data.data.value);
        }
    }, [data]);

    const handleSetValue = async (value: number) => {
        setIsSetting(true);
        try {
            await setAcOutputSource.mutateAsync(value);
            closeModal();
        } catch {
            // Error is handled by the mutation's onError
        } finally {
            setIsSetting(false);
        }
    };

    const isDisabled = isSetting || setAcOutputSource.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md">
                <DialogClose onClose={closeModal} />
                <DialogHeader>
                    <DialogTitle>AC Output Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading current value...
                        </div>
                    ) : (
                        <>
                            {currentValue !== null && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Current value:{" "}
                                    <strong>
                                        {
                                            AC_OUTPUT_OPTIONS.find(
                                                (o) => o.value === currentValue,
                                            )?.label
                                        }{" "}
                                        ({currentValue})
                                    </strong>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Choose the AC output source priority for the
                                inverter.
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                {AC_OUTPUT_OPTIONS.map(({ value, label, Icon }) => {
                                    const isActive = currentValue === value;
                                    return (
                                        <Button
                                            key={value}
                                            onClick={() => setPendingValue(value)}
                                            disabled={isDisabled}
                                            variant={
                                                isActive ? "default" : "outline"
                                            }
                                            className="h-auto py-3 px-4 flex flex-col items-start justify-start gap-1 hover:bg-accent text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {label}
                                                </span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                            {pendingValue !== null && (
                                <div className="space-y-2 border-t pt-3 mt-2">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Change AC output source to{" "}
                                        <strong>
                                            {
                                                AC_OUTPUT_OPTIONS.find(
                                                    (o) =>
                                                        o.value === pendingValue,
                                                )?.label
                                            }{" "}
                                            ({pendingValue})
                                        </strong>
                                        ?
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setPendingValue(null)}
                                            disabled={isDisabled}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSetValue(pendingValue)
                                            }
                                            disabled={isDisabled}
                                        >
                                            Confirm change
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {isDisabled && (
                                <div className="flex items-center justify-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting...
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AcOutputSourceModal;
