import { create } from "zustand";

interface BatteryModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useBatteryModalStore = create<BatteryModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));

