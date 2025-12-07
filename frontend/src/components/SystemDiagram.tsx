import { Battery, Home, Power } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const SystemDiagram = () => {
    return (
        <Card className="w-full h-full">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                    {/* Solar Panels - Top */}
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full from-blue-400 to-purple-500 shadow-md flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-3 w-3 bg-white rounded-sm"
                                    ></div>
                                ))}
                            </div>
                        </div>
                        <span className="text-xs font-medium text-foreground mt-1">
                            PV
                        </span>
                    </div>

                    {/* Arrow down from Solar Panels */}
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                    </div>

                    {/* Inverter Row with Grid and House */}
                    <div className="flex items-center justify-center space-x-12">
                        {/* Grid Connection - Left */}
                        <div className="flex flex-col items-center space-y-1">
                            <div className="h-14 w-14 rounded-full from-gray-400 to-gray-600 shadow-md flex items-center justify-center">
                                <Power className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                Grid
                            </span>
                            {/* Horizontal arrows from grid to inverter */}
                            <div className="flex items-center space-x-1 mt-2">
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="w-0 h-0 border-t-transparent border-b-transparent border-l-gray-300"></div>
                            </div>
                        </div>

                        {/* Inverter - Center */}
                        <div className="flex flex-col items-center space-y-1">
                            <div className="h-20 w-20 rounded-full from-blue-500 to-indigo-700 shadow-md flex items-center justify-center">
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                                    <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                Inverter
                            </span>
                        </div>

                        {/* House/Load - Right */}
                        <div className="flex flex-col items-center space-y-1">
                            <div className="h-14 w-14 rounded-full from-red-400 to-pink-500 shadow-md flex items-center justify-center">
                                <Home className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                Load
                            </span>
                            {/* Horizontal arrows from inverter to house */}
                            <div className="flex items-center space-x-1 mt-2">
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="w-0 h-0 border-t-transparent border-b-transparent border-l-gray-300"></div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow down from Inverter to Battery */}
                    <div className="flex flex-col items-center mt-2">
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                    </div>

                    {/* Battery - Bottom */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="h-20 w-20 rounded-full from-green-400 to-emerald-500 shadow-md flex items-center justify-center">
                            <Battery className="h-10 w-10 text-white" />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                            Battery
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SystemDiagram;
