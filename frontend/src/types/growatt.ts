import { z } from "zod";

export type Plant = {
    id: string;
    plantName: string;
    timezone: string;
};

export type PlantDetails = {
    country: string;
    formulaCo2: string;
    accountName: string;
    city: string;
    timezone: string;
    co2: string;
    gridCompany: string;
    creatDate: string;
    formulaCoal: string;
    gridPort: string;
    gridLfdi: string;
    fixedPowerPrice: string;
    id: string;
    lat: string;
    valleyPeriodPrice: string;
    tempType: string;
    lng: string;
    tree: string;
    peakPeriodPrice: string;
    plantType: string;
    nominalPower: string;
    formulaMoney: string;
    formulaTree: string;
    flatPeriodPrice: string;
    eTotal: string;
    protocolId: string;
    isShare: string;
    gridServerUrl: string;
    coal: string;
    moneyUnit: string;
    plantName: string;
    moneyUnitText: string;
};

export type Weather = {
    city: string;
    Week: string;
    dataStr: string;
    data: {
        HeWeather6: {
            now: {
                cloud: string;
                hum: string;
                wind_deg: string;
                pres: string;
                pcpn: string;
                fl: string;
                tmp: string;
                wind_sc: string;
                cond_txt: string;
                wind_dir: string;
                wind_spd: string;
                cond_code: string;
            };
            update: {
                loc: string;
                utc: string;
            };
            basic: {
                ss: string;
                admin_area: string;
                tz: string;
                toDay: string;
                location: string;
                lon: string;
                parent_city: string;
                cnty: string;
                lat: string;
                cid: string;
                sr: string;
            };
            status: string;
        }[];
    };
    radiant: string;
    tempType: number;
};

export type FaultLog = {
    pages: number;
    currPage: number;
    datas: any[];
    count: number;
};

export type Device = [string, string, string, string];

export type Devices = Device[];

export type DeviceTotalData = {
    deviceType: string;
    useEnergyToday: string;
    chargeToday: string;
    eDischargeTotal: string;
    eDischargeToday: string;
    useEnergyTotal: string;
    eToUserTotal: string;
    epvToday: string;
    epvTotal: string;
    chargeTotal: string;
    eToGridToday: string;
    eToUserToday: string;
    eToGridTotal: string;
};

export type DeviceStatusData = {
    vPv2: string; // input PV2 voltage (V)
    deviceType: string; // Storage device type (0: SP2000, 1: SP3000, 5: SPF 6000 ES PLUS)
    gridPower: string; // Grid-side power (W)
    loadPower: string; // Load power / user-side output power (W)
    vPv1: string; // input PV1 voltage (V)
    fAcOutput: string; // AC output frequency (Hz)
    invStatus: string; // Inverter internal status code (device-specific)  // Device status, status (0: Offline, 1: Online, 2: Charging, 3: Discharging, 4: Error, 5: Burning, 6: Solar Charging, 7: Grid Charging, 8: Combined Charging (both solar and grid), 9: Combined Charging and Bypass (Grid) Output, 10: PV Charging and Bypass (Grid) Output, 11: Grid Charging and Bypass (Grid) Output, 12: Bypass (Grid) Output, 13: Solar Charging and Discharging Simultaneously, 14: Grid Charging and Discharging Simultaneously) (Shangk: 1: No Output, 2: Reserved, 3: Discharging, 4: Error, 5: Burning, 6: Solar Charging, 7: Grid Charging, 8: Combined Charging (both solar and grid), 9: Combined Charging and Bypass (Grid) Output, 10: PV Charging and Bypass (Grid) Output, 11: Grid Charging and Bypass (Grid) Output, 12: Bypass (Grid) Output, 13: Solar Charging and Discharging Simultaneously)
    ppv2: string; // PV2 panel input power (W)
    vBat: string; // Battery voltage (V)
    loadPrecent: string; // Load percentage (%)
    panelPower: string; // Total PV panel power (W)
    batPower: string; // Battery charging/discharging power (W)
    vAcOutput: string; // AC output voltage (V)
    capacity: string; // Battery state of charge (%)
    ppv1: string; // PV1 panel input power (W)
    iPv1: string; // PV1 input current (A)
    iPv2: string; // PV2 input current (A)
    vAcInput: string; // Grid voltage (V)
    fAcInput: string; // Grid frequency (Hz)
    iTotal: string; // Total inverter output current (A)
    rateVA: string; // Apparent power (VA)
    status: string; // Storage device status (0: Operating, 1: Charge, 2: Discharge, 3: Fault, 4: Flash)
};

export type DeviceHistoryDataList = {
    endDate: string;
    datas: DeviceHistoryData[];
    start: number;
    haveNext: boolean;
};

export type DeviceHistoryData = {
    serialNum: string;
    address: number;
    calendar: {
        year: number;
        month: number;
        dayOfMonth: number;
        hourOfDay: number;
        minute: number;
        second: number;
    };
    withTime: boolean;
    status: number;
    pCharge: number;
    pDischarge: number;
    vpv: number;
    ipv: number;
    iCharge: number;
    iDischarge: number;
    ppv: number;
    vBuck: number;
    vac: number;
    iacToUser: number;
    pacToUser: number;
    iacToGrid: number;
    pacToGrid: number;
    vBat: number;
    capacity: number;
    temperature: number;
    ipmTemperature: number;
    errorCode: number;
    warnCode: number;
    dischargeToStandbyReason: number;
    chargeToStandbyReason: number;
    bmsStatus: number;
    bmsError: number;
    gaugeBattteryStatus: number;
    gaugeOperationStatus: number;
    gaugePackStatus: number;
    cycleCount: number;
    maxChargeOrDischargeCurrent: number;
    bmsCurrent: number;
    bmsTemperature: number;
    gaugeICCurrent: number;
    gaugeRM1: number;
    gaugeRM2: number;
    vBus: number;
    batTemp: number;
    normalPower: number;
    remoteCntlEn: number;
    vpv2: number;
    ppv2: number;
    pCharge2: number;
    pDischarge2: number;
    vBuck2: number;
    epvToday2: number;
    epvTotal2: number;
    eChargeToday2: number;
    eChargeTotal2: number;
    eDischargeToday2: number;
    eDischargeTotal2: number;
    remoteCntlFailReason: number;
    isAgain: boolean;
    deviceType: number;
    constantVolt: number;
    deltaVolt: number;
    soh: number;
    warnInfo: number;
    cellVoltage1: number;
    cellVoltage2: number;
    cellVoltage3: number;
    cellVoltage4: number;
    cellVoltage5: number;
    cellVoltage6: number;
    cellVoltage7: number;
    cellVoltage8: number;
    cellVoltage9: number;
    cellVoltage10: number;
    bmsStatus2: number;
    bmsError2: number;
    constantVolt2: number;
    deltaVolt2: number;
    soh2: number;
    cycleCount2: number;
    maxChargeOrDischargeCurrent2: number;
    bmsCurrent2: number;
    bmsTemperature2: number;
    warnInfo2: number;
    gauge2RM1: number;
    gauge2RM2: number;
    cell2Voltage1: number;
    cell2Voltage2: number;
    cell2Voltage3: number;
    cell2Voltage4: number;
    cell2Voltage5: number;
    cell2Voltage6: number;
    cell2Voltage7: number;
    cell2Voltage8: number;
    cell2Voltage9: number;
    cell2Voltage10: number;
    cell2Voltage11: number;
    cell2Voltage12: number;
    cell2Voltage13: number;
    cell2Voltage14: number;
    cell2Voltage15: number;
    cell2Voltage16: number;
    bmsConstantVolt: number;
    bmsDeltaVolt: number;
    bmsSoh: number;
    bmsWarnInfo: number;
    bmsCellVoltage1: number;
    bmsCellVoltage2: number;
    bmsCellVoltage3: number;
    bmsCellVoltage4: number;
    bmsCellVoltage5: number;
    bmsCellVoltage6: number;
    bmsCellVoltage7: number;
    bmsCellVoltage8: number;
    bmsCellVoltage9: number;
    bmsCellVoltage10: number;
    bmsCellVoltage11: number;
    bmsCellVoltage12: number;
    bmsCellVoltage13: number;
    bmsCellVoltage14: number;
    bmsCellVoltage15: number;
    bmsCellVoltage16: number;
    rateVA: number;
    rateWatt: number;
    chargeMonth: number;
    dischargeMonth: number;
    chgCurr: number;
    dischgCurr: number;
    eopDischrToday: number;
    eopDischrTotal: number;
    InvTemperature: number;
    DcDcTemperature: number;
    Buck1_NTCTemperature: number;
    Buck2_NTCTemperature: number;
    warnCode2: number;
    bmsSoc: number;
    bmsBatteryVolt: number;
    bmsBatteryCurr: number;
    bmsBatteryTemp: number;
    bmsMaxCurrChg: number;
    bmsCvolt: number;
    bmsInfo: number;
    bmsPackInfo: number;
    bmsUsingCap: number;
    bmsCellVolt1: number;
    bmsCellVolt2: number;
    bmsCellVolt3: number;
    bmsCellVolt4: number;
    bmsCellVolt5: number;
    bmsCellVolt6: number;
    bmsCellVolt7: number;
    bmsCellVolt8: number;
    bmsCellVolt9: number;
    bmsCellVolt10: number;
    bmsCellVolt11: number;
    bmsCellVolt12: number;
    bmsCellVolt13: number;
    bmsCellVolt14: number;
    bmsCellVolt15: number;
    bmsCellVolt16: number;
    moduleId: number;
    moduleTotalVolt: number;
    moduleTotalCurr: number;
    moduleSoc: number;
    moduleStatus: number;
    batProtect1: number;
    batWarnInfo1: number;
    packNum: number;
    batDepowerReason: number;
    gaugeRM: number;
    gaugeFCC: number;
    requestBatteryType: number;
    maxCellVolt: number;
    minCellVolt: number;
    maxminCellVoltNum: number;
    protectPackID: number;
    manufacture: number;
    hardwareVersion: number;
    parallelHightSoftwarVer: number;
    maxCellTemp: number;
    minCellTemp: number;
    maxminCellTempSerialNum: number;
    maxminSoc: number;
    totalCellNum: number;
    batProtect2: number;
    batProtect3: number;
    batWarnInfo2: number;
    updateStatus: number;
    batSerialNumId: number;
    moduleId2: number;
    module2MaxVolt: number;
    module2MinVolt: number;
    module2MaxTemp: number;
    module2MinTemp: number;
    doStatus: number;
    dsgBatNum: number;
    dsgEnergy: number;
    chgBatNum: number;
    chgEnergy: number;
    floatChargeVolt: number;
    eGenDischrToday: number;
    eGenDischrTotal: number;
    eGenDischrPower: number;
    genVolt: number;
    eBatChgToday: number;
    eBatChgTotal: number;
    lLCTemperature: number;
    envTemperature: number;
    vGrid2: number;
    iAcCharge1: number;
    iAcCharge2: number;
    pAcInPut1: number;
    pAcInPut2: number;
    pAcOutPut: number;
    outPutVolt2: number;
    outPutCurrent2: number;
    outPutPower1: number;
    outPutPower2: number;
    loadPercent1: number;
    loadPercent2: number;
    genVolt2: number;
    eGenDischrPower1: number;
    eGenDischrPower2: number;
    genCurrent: number;
    genCurrent1: number;
    genCurrent2: number;
    warnCode3: number;
    qBat: number;
    vGrid3: number;
    iAcCharge3: number;
    pAcInPut3: number;
    genVolt3: number;
    genCurrent3: number;
    eGenDischrPower3: number;
    outPutVolt3: number;
    outPutCurrent3: number;
    outPutPower3: number;
    loadPercent3: number;
    chargeMap: Record<string, number>;
    dischargeMap: Record<string, number>;
    faultCode: number;
    epvToday: number;
    epvTotal: number;
    eChargeToday: number;
    eChargeTotal: number;
    eDischargeToday: number;
    eDischargeTotal: number;
    eToUserToday: number;
    eToUserTotal: number;
    eToGridToday: number;
    eToGridTotal: number;
    lost: boolean;
    chargeWay: number;
    iChargePV1: number;
    iChargePV2: number;
    outPutPower: number;
    pAcCharge: number;
    vGrid: number;
    freqGrid: number;
    outPutVolt: number;
    freqOutPut: number;
    loadPercent: number;
    outPutCurrent: number;
    eacChargeToday: number;
    eacChargeTotal: number;
    eBatDisChargeToday: number;
    eBatDisChargeTotal: number;
    eacDisChargeToday: number;
    eacDisChargeTotal: number;
    iAcCharge: number;
    pAcInPut: number;
    pBat: number;
    powSavingEn: number;
    uwBatType2: number;
    bLightEn: number;
    manualStartEn: number;
    sciLossChkEn: number;
};

export const historyDataRequestSchema = z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    start: z.coerce
        .number()
        .min(0, "Start page number is required")
        .optional()
        .default(0),
});

export type HistoryDataRequest = z.infer<typeof historyDataRequestSchema>;

export type GrowattDeviceStatusResponse = DeviceStatusData | null;

export type GrowattReloginResponse = {
    connected: boolean;
    plantId: string | null;
    device: string | null;
};

export type GrowattSubscriptionStatusResponse = {
    connected: boolean;
    plantId: string | null;
    device: string | null;
};

export const plantFaultLogRequestSchema = z.object({
    date: z.string().min(1, "Date is required"),
    toPageNum: z.coerce
        .number()
        .min(1, "To page number is required")
        .optional()
        .default(1),
});

export type PlantFaultLogRequest = z.infer<typeof plantFaultLogRequestSchema>;
