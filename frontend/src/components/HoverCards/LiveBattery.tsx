import { getDeviceStatusService } from "@/service/growatt";
import AnimatedNumber from "../CustomNodes/AnimatedNumber";

const LiveBattery = () => {
    const { data: deviceStatus } = getDeviceStatusService();
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Status</p>
                    <p className={`text-lg font-mono font-bold`}>
                        {Number(deviceStatus?.data?.batPower || 0) < 0
                            ? "Charging"
                            : "Discharging"}
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Battery Power</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Math.abs(
                                Number(deviceStatus?.data?.batPower || 0)
                            )}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Battery Voltage</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.vBat || 0)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Battery Capacity</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.capacity || 0)}
                            decimals={1}
                            suffix="%"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveBattery;
