import { getDeviceStatusService } from "@/service/growatt";
import AnimatedNumber from "../CustomNodes/AnimatedNumber";

const LiveLoad = () => {
    const { data: deviceStatus } = getDeviceStatusService();
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Load Power</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.loadPower || 0)}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Load Voltage</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.vAcOutput || 0)}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Load Frequency</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.fAcOutput || 0)}
                            decimals={2}
                            suffix="Hz"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveLoad;
