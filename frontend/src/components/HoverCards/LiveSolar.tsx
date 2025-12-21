import { getDeviceStatusService } from "@/service/growatt";
import AnimatedNumber from "../CustomNodes/AnimatedNumber";

const LiveSolar = ({ id }: { id: 1 | 2 }) => {
    const { data: deviceStatus } = getDeviceStatusService();
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-start w-full p-2 h-full">
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Solar {id} Power</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(
                                deviceStatus?.data?.[`ppv${id}`] || 0
                            )}
                            decimals={0}
                            suffix="W"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Solar {id} Voltage</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(
                                deviceStatus?.data?.[`vPv${id}`] || 0
                            )}
                            decimals={1}
                            suffix="V"
                        />
                    </p>
                </div>
                <div className="w-full h-full flex items-center justify-between">
                    <p className="text-xs">Solar {id} Current</p>
                    <p className={`text-lg font-mono font-bold`}>
                        <AnimatedNumber
                            value={Number(
                                deviceStatus?.data?.[`iPv${id}`] || 0
                            )}
                            decimals={2}
                            suffix="A"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveSolar;
