import { getTotalDataService } from "@/service/growatt";
import { Sun, Battery, Home, Power } from "lucide-react";
import { Separator } from "./ui/separator";

interface MetricCard {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    todayKwh: number;
    totalKwh: number;
}

const TotalMetrics = () => {
    const { data: totalData } = getTotalDataService();

    // Define metric configurations with data field mappings
    const metricConfigs = [
        {
            title: "Solar Output",
            icon: Sun,
            iconColor: "text-teal-500",
            todayField: "epvToday",
            totalField: "epvTotal",
        },
        {
            title: "Discharging",
            icon: Battery,
            iconColor: "text-blue-500",
            todayField: "eDischargeToday",
            totalField: "eDischargeTotal",
        },
        {
            title: "Imported from Grid",
            icon: Power,
            iconColor: "text-orange-500",
            todayField: "eToUserToday",
            totalField: "eToUserTotal",
        },
        {
            title: "Load Consumption",
            icon: Home,
            iconColor: "text-red-500",
            todayField: "useEnergyToday",
            totalField: "useEnergyTotal",
        },
    ];

    // Extract the actual device data from the response
    // Handle both DataResponse structure (totalData.data) and direct json structure (totalData.json)
    const deviceData = totalData?.data || (totalData as any)?.json || null;

    // Map data to metrics
    const metrics: MetricCard[] = metricConfigs.map((config) => ({
        title: config.title,
        icon: config.icon,
        iconColor: config.iconColor,
        todayKwh: deviceData
            ? parseFloat(
                  String(
                      deviceData[
                          config.todayField as keyof typeof deviceData
                      ] || "0"
                  )
              )
            : 0,
        totalKwh: deviceData
            ? parseFloat(
                  String(
                      deviceData[
                          config.totalField as keyof typeof deviceData
                      ] || "0"
                  )
              )
            : 0,
    }));

    return (
        <>
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="col-span-1 row-span-1 border-4 border-gray-500 rounded-lg flex flex-col items-center justify-center"
                >
                    <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
                        <metric.icon
                            className={`w-1/2 h-1/2 ${metric.iconColor}`}
                        />
                        <p className="md:text-md text-xs font-extrabold font-mono">
                            {metric.title}
                        </p>
                    </div>
                    <div className="flex items-center justify-around w-full p-2 h-full">
                        <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center">
                            {metric.todayKwh.toFixed(1)}
                            <div className="flex flex-col items-center justify-center">
                                <div className="md:text-lg text-xs">kWh</div>
                                <div className="md:text-lg text-xs">Today</div>
                            </div>
                        </div>
                        <Separator
                            orientation="vertical"
                            className="border border-gray-500"
                        />
                        <div className="md:text-4xl text-md font-mono font-bold flex flex-col items-center justify-center">
                            {metric.totalKwh.toFixed(1)}
                            <div className="flex flex-col items-center justify-center">
                                <div className="md:text-lg text-xs">kWh</div>
                                <div className="md:text-lg text-xs">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default TotalMetrics;
