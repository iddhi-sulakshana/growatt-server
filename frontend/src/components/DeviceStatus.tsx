import type { GrowattDeviceStatusResponse } from "@/types/growatt";
import { getDeviceStatus, getInverterStatus } from "@/types/enums";
import { Fragment } from "react/jsx-runtime";

const DeviceStatus = ({
    deviceStatus,
}: {
    deviceStatus: GrowattDeviceStatusResponse | undefined;
}) => {
    if (!deviceStatus) {
        return (
            <div className="p-4 flex justify-between items-center text-center text-gray-500 gap-10">
                No device status data available
            </div>
        );
    }

    return (
        <Fragment>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Load Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.loadPower || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Load Percentage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.loadPrecent || "0"}
                        <span className="text-xs">%</span>
                    </p>
                </div>
            </div>
            {/* Battery Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Battery Voltage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.vBat || "0"}
                        <span className="text-xs">V</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Battery Capacity</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.capacity || "0"}
                        <span className="text-xs">%</span>
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Battery Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.batPower || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Device Status</p>
                    <p className="text-lg font-bold">
                        {getDeviceStatus(deviceStatus.status)}
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-1">
                <div className="flex items-center justify-between w-full">
                    <p className="text-xs font-bold">Inverter Status</p>
                    <p className="text-xs font-bold">
                        {getInverterStatus(deviceStatus.invStatus)}
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Total Inverter Current</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.iTotal || "0"}
                        <span className="text-xs">A</span>
                    </p>
                </div>
            </div>

            {/* PV Panel Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">PV1 Voltage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.vPv1 || "0"}
                        <span className="text-xs">V</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">PV2 Voltage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.vPv2 || "0"}
                        <span className="text-xs">V</span>
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">PV1 Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.ppv1 || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">PV2 Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.ppv2 || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Total Panel Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.panelPower || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">PV1 Current</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.iPv1 || "0"}
                        <span className="text-xs">A</span>
                    </p>
                </div>
            </div>

            {/* Grid Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Grid Voltage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.vAcInput || "0"}
                        <span className="text-xs">V</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Grid Frequency</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.fAcInput || "0"}
                        <span className="text-xs">Hz</span>
                    </p>
                </div>
            </div>

            {/* AC Output Information */}
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">AC Output Voltage</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.vAcOutput || "0"}
                        <span className="text-xs">V</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">AC Output Frequency</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.fAcOutput || "0"}
                        <span className="text-xs">Hz</span>
                    </p>
                </div>
            </div>
            <div className="p-1 flex justify-between items-center gap-10">
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Grid Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.gridPower || "0"}
                        <span className="text-xs">W</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-bold">Apparent Power</p>
                    <p className="text-lg font-bold">
                        {deviceStatus.rateVA || "0"}
                        <span className="text-xs">VA</span>
                    </p>
                </div>
            </div>
        </Fragment>
    );
};

export default DeviceStatus;
