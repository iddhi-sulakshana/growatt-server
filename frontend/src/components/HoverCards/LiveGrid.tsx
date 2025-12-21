import { getDeviceStatusService } from "@/service/growatt";
import AnimatedNumber from "../CustomNodes/AnimatedNumber";

const LiveGrid = () => {
    const { data: deviceStatus } = getDeviceStatusService();
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Grid Power</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.gridPower || 0)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Grid Voltage</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.vAcInput || 0)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Grid Frequency</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.fAcInput || 0)}
                            decimals={2}
                            suffix="Hz"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveGrid;
