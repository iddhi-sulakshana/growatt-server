/**
 * Available inverter setting types and their configurations
 */

export const INVERTER_SETTING_TYPES = {
    MAX_CHARGE_CURRENT: "maxChargeCurrent",
    // Add more setting types here as needed
} as const;

export type InverterSettingType =
    (typeof INVERTER_SETTING_TYPES)[keyof typeof INVERTER_SETTING_TYPES];

/**
 * Storage SPF5000 specific setting types
 */
export const STORAGE_SPF5000_SETTINGS = {
    MAX_CHARGE_CURRENT: "storage_spf5000_max_charge_current",
    // Add more SPF5000 settings here as needed
} as const;

export type StorageSPF5000Setting =
    (typeof STORAGE_SPF5000_SETTINGS)[keyof typeof STORAGE_SPF5000_SETTINGS];

/**
 * Available setting actions by device type
 */
export const SETTING_ACTIONS = {
    STORAGE_SPF5000_SET: "storageSPF5000Set",
    // Add more actions here as needed
} as const;

export type SettingAction =
    (typeof SETTING_ACTIONS)[keyof typeof SETTING_ACTIONS];

/**
 * Helper function to get all available setting types
 */
export function getAvailableSettingTypes() {
    return {
        inverterSettings: Object.values(INVERTER_SETTING_TYPES),
        storageSPF5000Settings: Object.values(STORAGE_SPF5000_SETTINGS),
        actions: Object.values(SETTING_ACTIONS),
    };
}

