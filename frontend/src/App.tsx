import SystemDiagram from "./components/SystemDiagram";
import TotalValues from "./components/TotalValues";

const App = () => {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Growatt Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Photovoltaic System Monitoring
                    </p>
                </div>

                {/* Main Content: Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
                    {/* Left Side: System Diagram */}
                    <div className="w-full">
                        <SystemDiagram />
                    </div>

                    {/* Right Side: Metrics Grid */}
                    <div className="w-full">
                        <TotalValues />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
