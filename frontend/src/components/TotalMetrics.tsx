import { getTotalDataService } from "@/service/growatt";
import {
    Battery,
    BatteryFull,
    BatteryLow,
    BatteryMedium,
    Sun,
    UtilityPole,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";

const TotalMetrics = () => {
    const { data: totalData } = getTotalDataService();

    // Extract the actual device data from the response
    // Handle both DataResponse structure (totalData.data) and direct json structure (totalData.json)
    const deviceData = totalData?.data || (totalData as any)?.json || null;

    // Helper function to get value from deviceData
    const getValue = (field: string): number => {
        return deviceData
            ? parseFloat(
                  String(deviceData[field as keyof typeof deviceData] || "0")
              )
            : 0;
    };

    // Solar Output
    const solarToday = getValue("epvToday");
    const solarTotal = getValue("epvTotal");

    // Discharging
    const dischargeToday = getValue("eDischargeToday");
    const dischargeTotal = getValue("eDischargeTotal");
    const chargingIcons = [BatteryFull, BatteryMedium, BatteryLow, Battery];
    const [dischargeIconIndex, setDischargeIconIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDischargeIconIndex((prev) => (prev + 1) % chargingIcons.length);
        }, 500); // Cycle every 500ms

        return () => clearInterval(interval);
    }, []);

    // Imported from Grid
    const gridToday = getValue("eToUserToday");
    const gridTotal = getValue("eToUserTotal");

    // Load Consumption
    const loadToday = getValue("useEnergyToday");
    const loadTotal = getValue("useEnergyTotal");

    return (
        <>
            {/* Solar Output */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 dark:border-border rounded-lg flex flex-col items-center justify-center bg-card dark:bg-card">
                <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
                    <Sun
                        className="w-1/2 h-1/2 text-teal-500 dark:text-teal-400 animate-spin transition-all"
                        style={{ animationDuration: "6s" }}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono text-foreground">
                        Solar Output
                    </p>
                </div>
                <div className="flex items-center justify-around w-full p-2 h-full">
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {solarToday.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Today</div>
                        </div>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="border border-gray-500 dark:border-border"
                    />
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {solarTotal.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discharging */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 dark:border-border rounded-lg flex flex-col items-center justify-center bg-card dark:bg-card">
                <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
                    {(() => {
                        const DischargeIcon = chargingIcons[dischargeIconIndex];
                        return (
                            <DischargeIcon className="w-1/2 h-1/2 text-blue-500 dark:text-blue-400" />
                        );
                    })()}
                    <p className="md:text-md text-xs font-extrabold font-mono text-foreground">
                        Discharging
                    </p>
                </div>
                <div className="flex items-center justify-around w-full p-2 h-full">
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {dischargeToday.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Today</div>
                        </div>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="border border-gray-500 dark:border-border"
                    />
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {dischargeTotal.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Imported from Grid */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 dark:border-border rounded-lg flex flex-col items-center justify-center bg-card dark:bg-card">
                <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
                    <UtilityPole
                        className="w-1/2 h-1/2 text-red-500 dark:text-red-400 animate-pulse transition-all"
                        // style={{ animationDuration: "2s" }}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono text-foreground">
                        Imported from Grid
                    </p>
                </div>
                <div className="flex items-center justify-around w-full p-2 h-full">
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {gridToday.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Today</div>
                        </div>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="border border-gray-500 dark:border-border"
                    />
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {gridTotal.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Load Consumption */}
            <div className="col-span-1 row-span-1 border-4 border-gray-500 dark:border-border rounded-lg flex flex-col items-center justify-center bg-card dark:bg-card">
                <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
                    <Zap
                        className="w-1/2 h-1/2 text-orange-500 dark:text-orange-400 animate-pulse transition-all"
                        // style={{ animationDuration: "3s" }}
                    />
                    <p className="md:text-md text-xs font-extrabold font-mono text-foreground">
                        Load Consumption
                    </p>
                </div>
                <div className="flex items-center justify-around w-full p-2 h-full">
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {loadToday.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Today</div>
                        </div>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="border border-gray-500 dark:border-border"
                    />
                    <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center text-foreground">
                        {loadTotal.toFixed(1)}
                        <div className="flex flex-col items-center justify-center">
                            <div className="md:text-lg text-xs text-muted-foreground">kWh</div>
                            <div className="md:text-lg text-xs text-muted-foreground">Total</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TotalMetrics;
