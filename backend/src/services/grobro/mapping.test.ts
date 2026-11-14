import { expect, test } from "bun:test";
import { mapGroBroState, SPF_SYSTEM_STATUS_CODES } from "./mapping";

const sample = {
    System_Status: "PV charge and Discharge",
    PV1_Voltage: 185.5,
    PV2_Voltage: 198.0,
    PV1_Power: 604.0,
    PV2_Power: 660.0,
    PV1_Current: 3.4,
    PV2_Current: 3.4,
    Output_Power: 1270.0,
    Output_VA: 1389.0,
    Battery_Voltage: 54.38,
    Battery_SOC: 75,
    Battery_Power: 43.0,
    AC_In_Voltage: 232.2,
    AC_In_Freq: 50.08,
    AC_Out_Voltage: 230.1,
    AC_Out_Freq: 50.13,
    Load_Percentage: 23.1,
    AC_Input_Power: 0.0,
    DC_Out_Voltage: 6553.5,
    Time_Total: "",
};
const base = { invStatus: "-10", deviceType: "5", status: "5", vBat: "53.3" } as any;

test("maps every dashboard field from the GroBro sample", () => {
    const m = mapGroBroState(sample, base);
    expect(m).toMatchObject({
        ppv1: "604",
        ppv2: "660",
        panelPower: "1264",
        vPv1: "185.5",
        vPv2: "198",
        iPv1: "3.4",
        iPv2: "3.4",
        iTotal: "6.8",
        loadPower: "1270",
        rateVA: "1389",
        loadPrecent: "23.1",
        batPower: "43",
        vBat: "54.38",
        capacity: "75",
        gridPower: "0",
        vAcInput: "232.2",
        fAcInput: "50.08",
        vAcOutput: "230.1",
        fAcOutput: "50.13",
        status: "12",
    });
});

test("keeps invStatus and deviceType from the cloud base", () => {
    expect(mapGroBroState(sample, base)).toMatchObject({ invStatus: "-10", deviceType: "5" });
});

test("negative battery power (charging) keeps its sign", () => {
    expect(mapGroBroState({ ...sample, Battery_Power: -346.0 }, base).batPower).toBe("-346");
});

test("sums are rounded to one decimal", () => {
    expect(mapGroBroState({ ...sample, PV1_Current: 0.1, PV2_Current: 0.2 }, base).iTotal).toBe("0.3");
});

test("unknown status label keeps the cloud status; without base it falls back to the label", () => {
    expect(mapGroBroState({ ...sample, System_Status: "New Mode" }, base).status).toBe("5");
    expect(mapGroBroState({ ...sample, System_Status: "New Mode" }, null).status).toBe("New Mode");
});

test("missing field keeps the base value, or empty string without base", () => {
    const { Battery_Voltage: _omit, ...rest } = sample;
    expect(mapGroBroState(rest, base).vBat).toBe("53.3");
    expect(mapGroBroState(rest, null).vBat).toBe("");
});

test("status table covers GroBro's SPF enum", () => {
    expect(SPF_SYSTEM_STATUS_CODES["Standby"]).toBe("0");
    expect(SPF_SYSTEM_STATUS_CODES["PV charge and Discharge"]).toBe("12");
});
