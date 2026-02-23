import { create } from "zustand";

interface InverterModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useInverterModalStore = create<InverterModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
