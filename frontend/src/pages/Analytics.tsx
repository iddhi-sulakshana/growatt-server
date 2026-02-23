import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { AlertCircle, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import ActionButton from "@/components/ActionButton";
import { getHistoryDataApi } from "@/api/growatt";
import type { DeviceHistoryData } from "@/types/growatt";

const Analytics = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [startDate, setStartDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });
    const [chartData, setChartData] = useState<DeviceHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [itemsPerRequest, setItemsPerRequest] = useState(1);
    const isFetchingRef = useRef(false);
    const shouldStopRef = useRef(false);

    // Toggle states for each chart field
    const [fieldToggles, setFieldToggles] = useState({
        vBat: true,
        vpv1: false,
        vpv2: false,
        ppv1: false,
        ppv2: false,
        ipv1: false,
        ipv2: false,
        pOut: false,
        load: false,
        pBat: false,
        Buck1_NTCTemperature: false,
        Buck2_NTCTemperature: false,
        DcDcTemperature: false,
        InvTemperature: false,
    });

    // Color mapping for each field
    const fieldColors: Record<string, string> = {
        vBat: "#8b5cf6", // Purple
        vpv1: "#10b981", // Green
        vpv2: "#3b82f6", // Blue
        ppv1: "#f59e0b", // Orange
        ppv2: "#ef4444", // Red
        ipv1: "#06b6d4", // Cyan
        ipv2: "#ec4899", // Pink
        pOut: "#84cc16", // Lime
        load: "#6366f1", // Indigo
        pBat: "#f97316", // Orange-red
        Buck1_NTCTemperature: "#8b5cf6", // Purple
        Buck2_NTCTemperature: "#10b981", // Green
        DcDcTemperature: "#3b82f6", // Blue
        InvTemperature: "#f59e0b", // Orange
    };

    // Field labels
    const fieldLabels: Record<string, string> = {
        vBat: "Battery Voltage (V)",
        vpv1: "PV Voltage 1 (V)",
        vpv2: "PV Voltage 2 (V)",
        ppv1: "PV Power 1 (W)",
        ppv2: "PV Power 2 (W)",
        ipv1: "PV Current 1 (A)",
        ipv2: "PV Current 2 (A)",
        pOut: "Output Power (W)",
        load: "Load Percent (%)",
        pBat: "Battery Power (W)",
        Buck1_NTCTemperature: "Buck 1 Temperature (°C)",
        Buck2_NTCTemperature: "Buck 2 Temperature (°C)",
        DcDcTemperature: "DcDc Temperature (°C)",
        InvTemperature: "Inv Temperature (°C)",
    };

    const toggleField = (field: keyof typeof fieldToggles) => {
        setFieldToggles((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleLoadData = async () => {
        if (isFetchingRef.current) {
            // If already fetching, stop it
            shouldStopRef.current = true;
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setChartData([]); // Clear previous data
        isFetchingRef.current = true;
        shouldStopRef.current = false;

        try {
            let currentStart = 0;
            let hasMore = true;

            while (hasMore && !shouldStopRef.current) {
                const response = await getHistoryDataApi({
                    startDate,
                    endDate,
                    start: currentStart,
                });

                if (response.data) {
                    // Get evenly distributed items from the response
                    const datas = response.data.datas;
                    const totalLength = datas.length;
                    let selectedItems: DeviceHistoryData[] = [];

                    if (totalLength <= itemsPerRequest) {
                        // If total is less than or equal to requested, take all
                        selectedItems = datas;
                    } else {
                        // Calculate step size for even distribution
                        const step = Math.floor(totalLength / itemsPerRequest);
                        // Get evenly distributed items
                        for (let i = 0; i < itemsPerRequest; i++) {
                            const index = i * step;
                            if (index < totalLength) {
                                selectedItems.push(datas[index]);
                            }
                        }
                    }

                    // Store pagination info before clearing
                    const hasNext = response.data.haveNext;
                    const nextStart = response.data.start;

                    // Clear the response data from memory
                    response.data.datas = [];
                    response.data = null as any;

                    // Immediately add the selected data to the chart
                    if (selectedItems.length > 0) {
                        setChartData((prevData) => {
                            const newData = [...prevData, ...selectedItems];
                            return newData;
                        });
                    }

                    hasMore = hasNext;
                    currentStart = nextStart;
                } else {
                    hasMore = false;
                }
            }
        } catch (error) {
            console.error("Error fetching history data:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
            shouldStopRef.current = false;
        }
    };

    // Format data for chart - create time series from calendar data
    const formattedChartData = chartData
        .map((item) => {
            const { calendar } = item;
            const date = new Date(
                calendar.year,
                calendar.month - 1,
                calendar.dayOfMonth,
                calendar.hourOfDay,
                calendar.minute,
                calendar.second
            );

            return {
                time: date.toLocaleString(),
                timestamp: date.getTime(),
                vBat: item.vBat,
                vpv1: item.vpv,
                vpv2: item.vpv2,
                ppv1: item.ppv,
                ppv2: item.ppv2,
                ipv1: item.iChargePV1,
                ipv2: item.iChargePV2,
                pOut: item.outPutPower,
                load: item.loadPercent,
                pBat: item.pBat,
                Buck1_NTCTemperature: item.Buck1_NTCTemperature,
                Buck2_NTCTemperature: item.Buck2_NTCTemperature,
                DcDcTemperature: item.DcDcTemperature,
                InvTemperature: item.InvTemperature,
            };
        })
        .sort((a, b) => a.timestamp - b.timestamp);

    return (
        <main className="bg-gray-100 dark:bg-background min-h-screen h-screen w-screen flex items-center justify-center overflow-y-auto relative">
            <ActionButton />
            <div className="w-full h-full p-4 md:p-8">
                <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
                    {/* Date Range Selector */}
                    <div className="bg-white dark:bg-card rounded-lg shadow-md dark:shadow-none dark:border dark:border-border p-2 border-4 border-gray-500 dark:border-border">
                        <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                            <div className="flex-1 flex gap-2 items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-foreground text-nowrap">
                                    Items per Request
                                </label>
                                <select
                                    value={itemsPerRequest}
                                    onChange={(e) =>
                                        setItemsPerRequest(
                                            Number(e.target.value)
                                        )
                                    }
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-muted disabled:cursor-not-allowed bg-background dark:bg-background text-foreground"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 flex gap-2 items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-foreground text-nowrap">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-muted disabled:cursor-not-allowed bg-background dark:bg-background text-foreground"
                                />
                            </div>
                            <div className="flex-1 flex gap-2 items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-foreground text-nowrap">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-muted disabled:cursor-not-allowed bg-background dark:bg-background text-foreground"
                                />
                            </div>
                            <button
                                onClick={handleLoadData}
                                className={`px-6 py-2 text-white rounded-lg font-medium ${
                                    isLoading
                                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                        : "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
                                }`}
                            >
                                {isLoading ? "Stop" : "Load"}
                            </button>
                        </div>
                        {chartData.length > 0 && (
                            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-4">
                                Total data points: {chartData.length}
                            </p>
                        )}
                    </div>

                    {/* Toggle Controls */}
                    {formattedChartData.length > 0 && (
                        <div className="bg-white dark:bg-card rounded-lg shadow-md dark:shadow-none dark:border dark:border-border p-4 border-4 border-gray-500 dark:border-border">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-foreground mb-3">
                                Toggle Chart Lines
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(fieldToggles).map((field) => (
                                    <label
                                        key={field}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                fieldToggles[
                                                    field as keyof typeof fieldToggles
                                                ]
                                            }
                                            onChange={() =>
                                                toggleField(
                                                    field as keyof typeof fieldToggles
                                                )
                                            }
                                            className="w-4 h-4 rounded border-gray-300 dark:border-border text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{
                                                    backgroundColor:
                                                        fieldColors[field],
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-foreground">
                                                {fieldLabels[field]}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chart Area */}
                    <div className="flex-1 bg-white dark:bg-card rounded-lg shadow-md dark:shadow-none dark:border dark:border-border p-1 border-4 border-gray-500 dark:border-border">
                        {isError ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                                <p className="text-sm font-bold mt-2 text-foreground">
                                    Failed to load analytics
                                </p>
                                <button
                                    onClick={handleLoadData}
                                    className="mt-4 px-4 py-2 bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg hover:bg-green-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : formattedChartData.length === 0 && !isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-600 dark:text-muted-foreground">
                                    No data available for the selected date
                                    range
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                {isLoading && (
                                    <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <p className="text-sm font-medium">
                                            Loading data... ({chartData.length}{" "}
                                            points loaded)
                                        </p>
                                    </div>
                                )}
                                <div className="w-full flex-1 min-h-[500px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={formattedChartData}
                                            margin={{
                                                top: 0,
                                                right: 0,
                                                left: -35,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={isDark ? "#374151" : "#e5e7eb"}
                                            />
                                            <XAxis
                                                dataKey="time"
                                                angle={-90}
                                                textAnchor="end"
                                                height={100}
                                                interval="preserveStartEnd"
                                                stroke={isDark ? "#9ca3af" : "#374151"}
                                                tick={{ fill: isDark ? "#9ca3af" : "#374151" }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(
                                                        value
                                                    );
                                                    return date.toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        }
                                                    );
                                                }}
                                            />
                                            <YAxis
                                                angle={-80}
                                                stroke={isDark ? "#9ca3af" : "#374151"}
                                                tick={{ fill: isDark ? "#9ca3af" : "#374151" }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? "#1f2937" : "#fff",
                                                    border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                                                    borderRadius: "6px",
                                                }}
                                                labelStyle={{ color: isDark ? "#e5e7eb" : "#111827" }}
                                            />
                                            <Legend
                                                wrapperStyle={{ color: isDark ? "#e5e7eb" : "#374151" }}
                                            />
                                            {fieldToggles.vBat && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="vBat"
                                                    stroke={fieldColors.vBat}
                                                    strokeWidth={2}
                                                    name={fieldLabels.vBat}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.vpv1 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="vpv1"
                                                    stroke={fieldColors.vpv1}
                                                    strokeWidth={2}
                                                    name={fieldLabels.vpv1}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.vpv2 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="vpv2"
                                                    stroke={fieldColors.vpv2}
                                                    strokeWidth={2}
                                                    name={fieldLabels.vpv2}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.ppv1 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="ppv1"
                                                    stroke={fieldColors.ppv1}
                                                    strokeWidth={2}
                                                    name={fieldLabels.ppv1}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.ppv2 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="ppv2"
                                                    stroke={fieldColors.ppv2}
                                                    strokeWidth={2}
                                                    name={fieldLabels.ppv2}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.ipv1 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="ipv1"
                                                    stroke={fieldColors.ipv1}
                                                    strokeWidth={2}
                                                    name={fieldLabels.ipv1}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.ipv2 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="ipv2"
                                                    stroke={fieldColors.ipv2}
                                                    strokeWidth={2}
                                                    name={fieldLabels.ipv2}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.pOut && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="pOut"
                                                    stroke={fieldColors.pOut}
                                                    strokeWidth={2}
                                                    name={fieldLabels.pOut}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.load && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="load"
                                                    stroke={fieldColors.load}
                                                    strokeWidth={2}
                                                    name={fieldLabels.load}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.pBat && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="pBat"
                                                    stroke={fieldColors.pBat}
                                                    strokeWidth={2}
                                                    name={fieldLabels.pBat}
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.Buck1_NTCTemperature && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="Buck1_NTCTemperature"
                                                    stroke={
                                                        fieldColors.Buck1_NTCTemperature
                                                    }
                                                    strokeWidth={2}
                                                    name={
                                                        fieldLabels.Buck1_NTCTemperature
                                                    }
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.Buck2_NTCTemperature && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="Buck2_NTCTemperature"
                                                    stroke={
                                                        fieldColors.Buck2_NTCTemperature
                                                    }
                                                    strokeWidth={2}
                                                    name={
                                                        fieldLabels.Buck2_NTCTemperature
                                                    }
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.DcDcTemperature && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="DcDcTemperature"
                                                    stroke={
                                                        fieldColors.DcDcTemperature
                                                    }
                                                    strokeWidth={2}
                                                    name={
                                                        fieldLabels.DcDcTemperature
                                                    }
                                                    dot={false}
                                                />
                                            )}
                                            {fieldToggles.InvTemperature && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="InvTemperature"
                                                    stroke={
                                                        fieldColors.InvTemperature
                                                    }
                                                    strokeWidth={2}
                                                    name={
                                                        fieldLabels.InvTemperature
                                                    }
                                                    dot={false}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Charts */}
                    {/* {formattedChartData.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Battery Voltage</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={formattedChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="time"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="vBat"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                name="Battery Voltage (V)"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Battery Capacity</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={formattedChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="time"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="capacity"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                name="Capacity (%)"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
        </main>
    );
};

export default Analytics;
