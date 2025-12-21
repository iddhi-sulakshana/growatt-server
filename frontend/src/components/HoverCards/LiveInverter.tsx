import { getDeviceStatusService } from "@/service/growatt";
import AnimatedNumber from "../CustomNodes/AnimatedNumber";

const LiveInverter = () => {
    const { data: deviceStatus } = getDeviceStatusService();
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Inverter Load</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.loadPrecent || 0)}
                            decimals={0}
                            suffix="%"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Inverter Current </p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.iTotal || 0)}
                            decimals={1}
                            suffix="A"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Apparent Power</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(deviceStatus?.data?.rateVA || 0)}
                            decimals={2}
                            suffix="VA"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveInverter;
