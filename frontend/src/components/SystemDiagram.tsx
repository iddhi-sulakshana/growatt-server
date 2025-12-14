import {
    addEdge,
    ReactFlow,
    useEdgesState,
    useNodesState,
    type Connection,
    type Edge,
    type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";
import CustomNode from "./CustomNode";
import { getDeviceStatusService } from "@/service/growatt";

const initialNodes: Node[] = [
    // Solar panels - centered above inverter
    {
        id: "solar1",
        position: { x: 150, y: 0 },
        data: { icon: "solar", name: "Solar 1", id: "solar1" },
        type: "custom",
    },
    {
        id: "solar2",
        position: { x: 300, y: 0 },
        data: { icon: "solar", name: "Solar 2", id: "solar2" },
        type: "custom",
    },
    // Grid import - left side
    {
        id: "grid",
        position: { x: 50, y: 180 },
        data: { icon: "grid", name: "Grid", id: "grid" },
        type: "custom",
    },
    // Inverter/Machine - center
    {
        id: "inverter",
        position: { x: 225, y: 180 },
        data: { icon: "inverter", name: "Inverter", id: "inverter" },
        type: "custom",
    },
    // Consumption - right side
    {
        id: "consumption",
        position: { x: 400, y: 180 },
        data: { icon: "consumption", name: "Consumption", id: "consumption" },
        type: "custom",
    },
    // Battery - centered below inverter
    {
        id: "battery",
        position: { x: 225, y: 330 },
        data: { icon: "battery", name: "Battery", id: "battery" },
        type: "custom",
    },
];
const initialEdges: Edge[] = [
    // Solar panels to inverter
    {
        id: "solar1-inverter",
        source: "solar1",
        target: "inverter",
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "step",
        animated: true,
        style: { stroke: "#00c950", strokeWidth: 3 },
    },
    {
        id: "solar2-inverter",
        source: "solar2",
        target: "inverter",
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "step",
        animated: true,
        style: { stroke: "#00c950", strokeWidth: 3 },
    },
    // Grid to inverter
    {
        id: "grid-inverter",
        source: "grid",
        target: "inverter",
        sourceHandle: "right",
        targetHandle: "left",
        type: "step",
        animated: true,
        style: { stroke: "red", strokeWidth: 3 },
    },
    // Inverter to consumption
    {
        id: "inverter-consumption",
        source: "inverter",
        target: "consumption",
        sourceHandle: "right",
        targetHandle: "left",
        type: "step",
        animated: true,
        style: { stroke: "orange", strokeWidth: 3 },
    },
    // Battery to inverter (discharging)
    {
        id: "battery-inverter",
        source: "battery",
        target: "inverter",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "step",
        animated: true,
        style: { stroke: "#2b7fff", strokeWidth: 3 },
    },
];

const disabledColor = "gray";

const SystemDiagram = () => {
    const [nodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

    const { data: deviceStatus } = getDeviceStatusService();

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    useEffect(() => {
        if (!deviceStatus?.data) return;

        const ppv1 = Number(deviceStatus.data.ppv1) || 0;
        const ppv2 = Number(deviceStatus.data.ppv2) || 0;
        const gridPower = Number(deviceStatus.data.gridPower) || 0;
        const loadPower = Number(deviceStatus.data.loadPower) || 0;
        const batPower = Number(deviceStatus.data.batPower) || 0;

        const newEdges: Edge[] = [
            // Solar panel 1 to inverter
            {
                id: "solar1-inverter",
                source: "solar1",
                target: "inverter",
                sourceHandle: "bottom",
                targetHandle: "top",
                type: "step",
                animated: ppv1 > 0,
                style: {
                    stroke: ppv1 > 0 ? "#00c950" : disabledColor,
                    strokeWidth: 3,
                    opacity: ppv1 > 0 ? 1 : 0.3,
                },
            },
            // Solar panel 2 to inverter
            {
                id: "solar2-inverter",
                source: "solar2",
                target: "inverter",
                sourceHandle: "bottom",
                targetHandle: "top",
                type: "step",
                animated: ppv2 > 0,
                style: {
                    stroke: ppv2 > 0 ? "#00c950" : disabledColor,
                    strokeWidth: 3,
                    opacity: ppv2 > 0 ? 1 : 0.3,
                },
            },
            // Grid to inverter
            {
                id: "grid-inverter",
                source: "grid",
                target: "inverter",
                sourceHandle: "right",
                targetHandle: "left",
                type: "step",
                animated: gridPower > 0,
                style: {
                    stroke: gridPower > 0 ? "red" : disabledColor,
                    strokeWidth: 3,
                    opacity: gridPower > 0 ? 1 : 0.3,
                },
            },
            // Inverter to consumption
            {
                id: "inverter-consumption",
                source: "inverter",
                target: "consumption",
                sourceHandle: "right",
                targetHandle: "left",
                type: "step",
                animated: loadPower > 0,
                style: {
                    stroke: loadPower > 0 ? "orange" : disabledColor,
                    strokeWidth: 3,
                    opacity: loadPower > 0 ? 1 : 0.3,
                },
            },
            // Battery to inverter (discharging) - REMOVED inverter-battery (charging)
            {
                id: "battery-inverter",
                source: batPower > 0 ? "battery" : "inverter",
                target: batPower > 0 ? "inverter" : "battery",
                sourceHandle: batPower > 0 ? "top-source" : "bottom",
                targetHandle: batPower > 0 ? "bottom-target" : "top",
                type: "step",
                animated: batPower !== 0,
                style: {
                    stroke: batPower !== 0 ? "#2b7fff" : disabledColor,
                    strokeWidth: 3,
                    opacity: batPower !== 0 ? 1 : 0.3,
                },
            },
        ];

        setEdges(newEdges);
    }, [deviceStatus, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView={true}
                onConnect={onConnect}
                nodesDraggable={false}
                panOnDrag={false}
                zoomOnPinch={false}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                edgesReconnectable={false}
                elementsSelectable={false}
                selectNodesOnDrag={false}
                panActivationKeyCode={null}
                nodeTypes={{
                    custom: CustomNode,
                }}
                debug={true}
            />
        </div>
    );
};

export default SystemDiagram;
