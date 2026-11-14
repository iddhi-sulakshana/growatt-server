import { create } from "zustand";

type LiveConnectionState = {
    /** True while the live status stream is open and delivering events. */
    connected: boolean;
    setConnected: (connected: boolean) => void;
};

export const useLiveConnectionStore = create<LiveConnectionState>()((set) => ({
    connected: false,
    setConnected: (connected) => set({ connected }),
}));
