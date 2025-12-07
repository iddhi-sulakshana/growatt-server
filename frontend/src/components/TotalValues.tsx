import { Sun, Battery, Zap, Home, Power } from "lucide-react"
import { Card, CardContent } from "./ui/card"

interface MetricCard {
  title: string
  icon: React.ElementType
  iconColor: string
  todayKwh: number
  totalKwh: number
}

const TotalValues = () => {
  const metrics: MetricCard[] = [
    {
      title: "Photovoltaic Output",
      icon: Sun,
      iconColor: "bg-teal-500",
      todayKwh: 21.2,
      totalKwh: 41.9,
    },
    {
      title: "Discharging",
      icon: Battery,
      iconColor: "bg-blue-500",
      todayKwh: 3.6,
      totalKwh: 22.9,
    },
    {
      title: "Charging",
      icon: Zap,
      iconColor: "bg-purple-500",
      todayKwh: 21.2,
      totalKwh: 61.1,
    },
    {
      title: "Imported from Grid",
      icon: Power,
      iconColor: "bg-orange-500",
      todayKwh: 0.7,
      totalKwh: 78.7,
    },
    {
      title: "Load Consumption",
      icon: Home,
      iconColor: "bg-red-500",
      todayKwh: 1.5,
      totalKwh: 12.3,
    },
    {
      title: "Grid-tied",
      icon: Zap,
      iconColor: "bg-gray-500",
      todayKwh: 0.0,
      totalKwh: 0.0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="border shadow-sm flex flex-col">
            <CardContent className="p-5 flex flex-col items-center justify-center flex-1 space-y-3">
              {/* Circular Icon */}
              <div className={`h-16 w-16 rounded-full ${metric.iconColor} flex items-center justify-center shadow-md`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-sm font-semibold text-center">{metric.title}</h3>
              
              {/* Values */}
              <div className="text-center space-y-0.5 w-full">
                <div className="text-lg font-bold">{metric.todayKwh} Today kWh</div>
                <div className="text-sm text-muted-foreground">{metric.totalKwh} Total kWh</div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default TotalValues
