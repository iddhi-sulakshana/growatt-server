import type { DeviceStatusData } from "@/types/types";

/** GroBro's decoded state as published on homeassistant/grobro/<serial>/state. */
export type GroBroState = Record<string, number | string | null | undefined>;

/**
 * GroBro publishes System_Status as a label; the dashboard expects the register code.
 * Verbatim from GroBro's SPF register map (growatt_spf_registers.json).
 */
export const SPF_SYSTEM_STATUS_CODES: Record<string, string> = {
    Standby: "0",
    "(No Use)": "1",
    Discharge: "2",
    Fault: "3",
    Flash: "4",
    "PV charge": "5",
    "AC charge": "6",
    "Combine charge": "7",
    "Combine charge and Bypass": "8",
    "PV charge and Bypass": "9",
    "AC charge and Bypass": "10",
    Bypass: "11",
    "PV charge and Discharge": "12",
};

type NumericField = Exclude<keyof DeviceStatusData, "status" | "invStatus" | "deviceType">;

/** Dashboard field → GroBro field(s). Several fields are summed. */
const FIELD_MAP: Record<NumericField, string[]> = {
    ppv1: ["PV1_Power"],
    ppv2: ["PV2_Power"],
    panelPower: ["PV1_Power", "PV2_Power"],
    vPv1: ["PV1_Voltage"],
    vPv2: ["PV2_Voltage"],
    iPv1: ["PV1_Current"],
    iPv2: ["PV2_Current"],
    iTotal: ["PV1_Current", "PV2_Current"],
    loadPower: ["Output_Power"],
    rateVA: ["Output_VA"],
    loadPrecent: ["Load_Percentage"],
    batPower: ["Battery_Power"],
    vBat: ["Battery_Voltage"],
    capacity: ["Battery_SOC"],
    gridPower: ["AC_Input_Power"],
    vAcInput: ["AC_In_Voltage"],
    fAcInput: ["AC_In_Freq"],
    vAcOutput: ["AC_Out_Voltage"],
    fAcOutput: ["AC_Out_Freq"],
};

const toNumber = (value: GroBroState[string]): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const format = (value: number, decimals: number): string => {
    const factor = 10 ** decimals;
    return String(Math.round(value * factor) / factor);
};

/**
 * Maps GroBro's SPF state onto the cloud's DeviceStatusData shape (all strings).
 * Fields GroBro lacks or doesn't send keep the last cloud value from `base`, or "".
 */
export function mapGroBroState(
    state: GroBroState,
    base: DeviceStatusData | null
): DeviceStatusData {
    const fallback = (field: keyof DeviceStatusData): string => base?.[field] ?? "";

    const numeric = {} as Record<NumericField, string>;
    for (const [field, sources] of Object.entries(FIELD_MAP) as [NumericField, string[]][]) {
        const values = sources.map((source) => toNumber(state[source]));
        if (values.some((v) => v === null)) {
            numeric[field] = fallback(field);
            continue;
        }
        const total = (values as number[]).reduce((sum, v) => sum + v, 0);
        numeric[field] = format(total, sources.length > 1 ? 1 : 2);
    }

    const label = state.System_Status;
    const status =
        typeof label === "string" && SPF_SYSTEM_STATUS_CODES[label] !== undefined
            ? SPF_SYSTEM_STATUS_CODES[label]
            : base?.status ?? (typeof label === "string" ? label : "");

    return {
        ...numeric,
        status,
        invStatus: fallback("invStatus"),
        deviceType: fallback("deviceType"),
    };
}
