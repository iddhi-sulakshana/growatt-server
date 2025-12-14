/**
 * Enum mappings for Growatt device status values
 */

// Storage device status (status field)
export const DEVICE_STATUS_MAP: Record<string, string> = {
    "0": "Operating",
    "1": "Charge",
    "2": "Discharge",
    "3": "Fault",
    "4": "Flash",
    "12": "Bypass (Grid) Output",
};

// Inverter internal status code (invStatus field)
// Standard values (0-14) and negative values for error/offline states
// Note: Shangk devices may have different meanings for some values (1: No Output, 2: Reserved, 3-13 same)
export const INVERTER_STATUS_MAP: Record<string, string> = {
    "0": "Offline",
    "1": "Online", // Shangk: No Output
    "2": "Charging", // Shangk: Reserved
    "3": "Discharging",
    "4": "Error",
    "5": "Burning",
    "6": "Solar Charging",
    "7": "Grid Charging",
    "8": "Combined Charging (both solar and grid)",
    "9": "Combined Charging and Bypass (Grid) Output",
    "10": "PV Charging and Bypass (Grid) Output",
    "11": "Grid Charging and Bypass (Grid) Output",
    "12": "Bypass (Grid) Output",
    "13": "Solar Charging and Discharging Simultaneously",
    "14": "Grid Charging and Discharging Simultaneously",
};

// Storage device type (deviceType field)
export const DEVICE_TYPE_MAP: Record<string, string> = {
    "0": "SP2000",
    "1": "SP3000",
    "5": "SPF 6000 ES PLUS",
};

/**
 * Get mapped device status value
 */
export const getDeviceStatus = (status: string | undefined | null): string => {
    if (!status) return "N/A";
    return DEVICE_STATUS_MAP[status] || status;
};

/**
 * Get mapped inverter status value
 * Normalizes negative values to positive (e.g., -10 -> 10)
 */
export const getInverterStatus = (
    status: string | undefined | null
): string => {
    if (!status) return "N/A";
    // Normalize negative values to positive
    const normalizedStatus = status.startsWith("-")
        ? status.substring(1)
        : status;
    return INVERTER_STATUS_MAP[normalizedStatus] || status;
};

/**
 * Get mapped device type value
 */
export const getDeviceType = (
    deviceType: string | undefined | null
): string => {
    if (!deviceType) return "N/A";
    return DEVICE_TYPE_MAP[deviceType] || deviceType;
};
