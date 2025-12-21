import { AlertCircle, Loader2, TrendingUp, BarChart3, PieChart } from "lucide-react";
import ActionButton from "@/components/ActionButton";

const Analytics = () => {
    // Placeholder for analytics data - you can replace this with actual data fetching
    const isLoading = false;
    const isError = false;

    return (
        <main className="bg-gray-100 min-h-screen h-screen w-screen flex items-center justify-center overflow-y-auto relative">
            <ActionButton />
            <div className="w-full h-full p-4 md:p-8">
                <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-green-600" />
                            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
                        </div>
                        <p className="text-gray-600 mt-2">
                            View detailed analytics and insights about your system
                        </p>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {isLoading ? (
                            <div className="col-span-full flex items-center justify-center h-64 bg-white rounded-lg shadow-md border-4 border-gray-500">
                                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                            </div>
                        ) : isError ? (
                            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md border-4 border-gray-500">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                                <p className="text-sm font-bold mt-2">Failed to load analytics</p>
                            </div>
                        ) : (
                            <>
                                {/* Analytics Card 1 */}
                                <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500 flex flex-col items-center justify-center min-h-[200px]">
                                    <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">Performance Trends</h2>
                                    <p className="text-gray-600 text-center">
                                        Track your system performance over time
                                    </p>
                                </div>

                                {/* Analytics Card 2 */}
                                <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500 flex flex-col items-center justify-center min-h-[200px]">
                                    <BarChart3 className="w-12 h-12 text-green-600 mb-4" />
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">Usage Statistics</h2>
                                    <p className="text-gray-600 text-center">
                                        Detailed usage metrics and patterns
                                    </p>
                                </div>

                                {/* Analytics Card 3 */}
                                <div className="bg-white rounded-lg shadow-md p-6 border-4 border-gray-500 flex flex-col items-center justify-center min-h-[200px]">
                                    <PieChart className="w-12 h-12 text-green-600 mb-4" />
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">Data Distribution</h2>
                                    <p className="text-gray-600 text-center">
                                        Visualize data distribution and insights
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Analytics;

