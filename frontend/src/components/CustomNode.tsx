import { memo } from "react";
import BatteryNode from "./CustomNodes/BatteryNode";
import LoadNode from "./CustomNodes/LoadNode";
import GridNode from "./CustomNodes/GridNode";
import InverterNode from "./CustomNodes/InverterNode";
import SolarNode from "./CustomNodes/SolarNode";
import ClockNode from "./CustomNodes/ClockNode";

function CustomNode({ data }: { data: { id: string } }) {
    if (data.id === "battery") {
        return <BatteryNode />;
    }

    if (data.id === "grid") {
        return <GridNode />;
    }

    if (data.id === "consumption") {
        return <LoadNode />;
    }

    if (data.id === "solar1" || data.id === "solar2") {
        return <SolarNode id={data.id === "solar1" ? 1 : 2} />;
    }

    if (data.id === "inverter") {
        return <InverterNode />;
    }

    if (data.id === "clock") {
        return <ClockNode />;
    }
    return null;
}

export default memo(CustomNode);
