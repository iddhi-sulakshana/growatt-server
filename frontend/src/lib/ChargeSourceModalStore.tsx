import { create } from "zustand";

interface ChargeSourceModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useChargeSourceModalStore = create<ChargeSourceModalState>(
    (set) => ({
        isOpen: false,
        openModal: () => set({ isOpen: true }),
        closeModal: () => set({ isOpen: false }),
    })
);
