import { getTotalDataService } from "@/service/growatt";
import {
    Sun,
    Battery,
    Zap,
    Home,
    Power,
    Loader2,
    AlertCircle,
    BatteryCharging,
} from "lucide-react";

interface MetricCard {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    todayKwh: number;
    totalKwh: number;
}

const Metrics = () => {
    const {
        data: totalData,
        isError: isTotalDataError,
        isLoading: isTotalDataLoading,
    } = getTotalDataService();

    // Define metric configurations with data field mappings
    const metricConfigs = [
        {
            title: "Photovoltaic Output",
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
            title: "Charging",
            icon: BatteryCharging,
            iconColor: "text-purple-500",
            todayField: "chargeToday",
            totalField: "chargeTotal",
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
        {
            title: "Grid-tied",
            icon: Zap,
            iconColor: "text-gray-500",
            todayField: "eToGridToday",
            totalField: "eToGridTotal",
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

    if (isTotalDataLoading) {
        return (
            <div className="col-span-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isTotalDataError) {
        return (
            <div className="col-span-full flex items-center justify-center p-8">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-6 h-6" />
                    <span>Failed to load metrics data</span>
                </div>
            </div>
        );
    }

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
                        <p className="text-md font-extrabold font-mono">
                            {metric.title}
                        </p>
                    </div>
                    <div className="flex items-center justify-between w-full p-2 h-full">
                        <div className="text-3xl font-mono font-bold flex items-center justify-center gap-1">
                            {metric.todayKwh.toFixed(1)}
                            <div className="flex flex-col items-start justify-center">
                                <div className="text-xs">Today</div>
                                <div className="text-sm">kWh</div>
                            </div>
                        </div>

                        <div className="text-3xl font-mono font-bold flex items-center justify-center gap-1">
                            {metric.totalKwh.toFixed(1)}
                            <div className="flex flex-col items-start justify-center">
                                <div className="text-xs">Total</div>
                                <div className="text-sm">kWh</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default Metrics;
