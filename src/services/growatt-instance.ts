import Growatt from "./growatt";

// Singleton Growatt instance (lazy initialization)
let growattInstance: Growatt | null = null;

export function getGrowattInstance(): Growatt {
    if (!growattInstance) {
        growattInstance = new Growatt();
    }
    return growattInstance;
}

// Export getter for convenience
export const growatt = new Proxy({} as Growatt, {
    get(_target, prop) {
        const instance = getGrowattInstance();
        const value = instance[prop as keyof Growatt];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});
