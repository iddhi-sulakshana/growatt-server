# Growatt Server Client

A TypeScript client library for interacting with Growatt solar monitoring servers. This library provides a comprehensive interface to access plant data, device information, historical data, weather information, and fault logs from Growatt's monitoring platform.

## Features

-   🔐 **Authentication**: Secure login/logout with session management
-   🌱 **Plant Management**: Retrieve plant lists and detailed plant information
-   📊 **Device Data**: Access device status, total data, and historical data
-   🌤️ **Weather Integration**: Get weather information for plant locations
-   ⚠️ **Fault Logging**: Retrieve and filter fault logs by date and device
-   🔧 **Multi-Device Support**: Supports various Growatt device types (inverters, batteries, etc.)
-   📝 **TypeScript**: Fully typed with comprehensive type definitions
-   ⚡ **Bun Runtime**: Optimized for Bun runtime environment

## Prerequisites

-   [Bun](https://bun.sh) runtime (latest version)
-   TypeScript 5.0.0 or higher
-   A Growatt account with access to the monitoring server

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd GrowattServer
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp example.env .env
```

4. Edit `.env` with your credentials:

```env
GROWATT_USERNAME=your_username
GROWATT_PASSWORD=your_password
GROWATT_SERVER=https://server.growatt.com
```

## Usage

### Basic Example

```typescript
import ENV from "./utils/ENV";
ENV.configEnvironment();

import Growatt from "./service/growatt";

async function main() {
    const growatt = new Growatt();

    // Login to the Growatt server
    await growatt.login();

    // Get list of plants
    const plantList = await growatt.getPlantList();
    console.log("Plants:", plantList);

    // Get devices for a plant
    for (const plant of plantList) {
        const devices = await growatt.getDevicesOfPlant(plant.id);
        console.log(`Devices for plant ${plant.plantName}:`, devices);

        // Get device data
        for (const device of devices) {
            const totalData = await growatt.getPlantDeviceTotalData({
                plantId: plant.id,
                device,
            });
            console.log("Device total data:", totalData);
        }
    }

    // Logout
    await growatt.logout();
}

main();
```

### Advanced Example

```typescript
import Growatt from "./service/growatt";

async function getHistoricalData() {
    const growatt = new Growatt();
    await growatt.login();

    const plantList = await growatt.getPlantList();

    for (const plant of plantList) {
        // Get plant details
        const plantDetails = await growatt.getPlantData(plant.id);
        console.log("Plant details:", plantDetails);

        // Get weather information
        const weather = await growatt.getWeatherByPlantId(plant.id);
        console.log("Weather:", weather);

        // Get devices
        const devices = await growatt.getDevicesOfPlant(plant.id);

        for (const device of devices) {
            // Get device status
            const statusData = await growatt.getPlantDeviceStatusData({
                plantId: plant.id,
                device,
            });
            console.log("Device status:", statusData);

            // Get historical data
            const historyData = await growatt.getPlantDeviceHistoryData({
                plantId: plant.id,
                device,
                startDate: new Date("2025-01-01"),
                endDate: new Date("2025-01-31"),
                start: 0,
            });
            console.log("History data:", historyData);
        }

        // Get fault logs
        const faultLog = await growatt.getNewPlantFaultLog({
            plantId: plant.id,
            date: "2025-01", // YYYY-MM format
            deviceSn: "", // Optional: filter by device serial number
            toPageNum: 1,
        });
        console.log("Fault logs:", faultLog);
    }

    await growatt.logout();
}
```

## API Reference

### Growatt Class

#### Constructor

```typescript
const growatt = new Growatt();
```

#### Methods

##### `login(): Promise<void>`

Authenticates with the Growatt server using credentials from environment variables.

##### `logout(): Promise<void>`

Logs out from the Growatt server and clears the session.

##### `isConnected(): boolean`

Returns `true` if currently connected to the server.

##### `getPlantList(): Promise<Plant[]>`

Retrieves a list of all plants associated with the account.

**Returns:** Array of `Plant` objects with `id`, `plantName`, and `timezone`.

##### `getPlantData(plantId: string): Promise<PlantDetails | null>`

Gets detailed information about a specific plant.

**Parameters:**

-   `plantId`: The ID of the plant

**Returns:** `PlantDetails` object or `null` if not found.

##### `getWeatherByPlantId(plantId: string): Promise<Weather | null>`

Retrieves weather information for a plant's location.

**Parameters:**

-   `plantId`: The ID of the plant

**Returns:** `Weather` object or `null` if not found.

##### `getDevicesOfPlant(plantId: string): Promise<Devices>`

Gets all devices associated with a plant.

**Parameters:**

-   `plantId`: The ID of the plant

**Returns:** Array of `Device` tuples.

##### `getPlantDeviceTotalData({ plantId, device }): Promise<DeviceTotalData | null>`

Retrieves total/cumulative data for a device.

**Parameters:**

-   `plantId`: The ID of the plant
-   `device`: A `Device` tuple

**Returns:** `DeviceTotalData` object or `null`.

##### `getPlantDeviceStatusData({ plantId, device }): Promise<DeviceStatusData | null>`

Gets current status data for a device.

**Parameters:**

-   `plantId`: The ID of the plant
-   `device`: A `Device` tuple

**Returns:** `DeviceStatusData` object or `null`.

##### `getPlantDeviceHistoryData({ plantId, device, startDate, endDate, start }): Promise<DeviceHistoryDataList | null>`

Retrieves historical data for a device within a date range.

**Parameters:**

-   `plantId`: The ID of the plant
-   `device`: A `Device` tuple
-   `startDate`: Start date (Date object)
-   `endDate`: End date (Date object)
-   `start`: Pagination offset (number)

**Returns:** `DeviceHistoryDataList` object or `null`.

##### `getNewPlantFaultLog({ plantId, date, deviceSn, toPageNum }): Promise<FaultLog | null>`

Gets fault logs for a plant with optional filtering.

**Parameters:**

-   `plantId`: The ID of the plant
-   `date`: Date filter (empty string, "YYYY", "YYYY-MM", or "YYYY-MM-DD")
-   `deviceSn`: Optional device serial number filter
-   `toPageNum`: Page number for pagination

**Returns:** `FaultLog` object or `null`.

##### `getSerialNoOfDevice(device: Device): string`

Extracts the serial number from a device tuple.

**Parameters:**

-   `device`: A `Device` tuple

**Returns:** Serial number string.

## Project Structure

```
GrowattServer/
├── src/
│   ├── index.ts                 # Main entry point with example usage
│   ├── service/
│   │   └── growatt.ts          # Main Growatt service class
│   ├── types/
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── growatt.types.ts   # Device type configurations
│   └── utils/
│       ├── ENV.ts              # Environment variable management
│       └── parseret.ts         # Data parsing utilities
├── example.env                  # Example environment file
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Environment Variables

The following environment variables are required:

| Variable           | Description                   | Example                      |
| ------------------ | ----------------------------- | ---------------------------- |
| `GROWATT_USERNAME` | Your Growatt account username | `user@example.com`           |
| `GROWATT_PASSWORD` | Your Growatt account password | `your_password`              |
| `GROWATT_SERVER`   | Growatt server URL            | `https://server.growatt.com` |

## Scripts

-   `bun run start` - Run the main script
-   `bun run dev` - Run in watch mode (auto-reload on changes)

## Error Handling

All methods handle errors gracefully and return `null` or empty arrays on failure. Error messages are logged to the console. Make sure to check return values before using them:

```typescript
const plantData = await growatt.getPlantData(plantId);
if (plantData) {
    // Use plantData safely
} else {
    console.error("Failed to retrieve plant data");
}
```

## Supported Device Types

The library supports various Growatt device types including:

-   Inverters (MAX, MIX, INV, TLX, TLXH)
-   Storage systems
-   SPA devices
-   HPS devices
-   NOAH devices
-   Backflow devices (single and multiple)

## TypeScript Support

This project is fully typed with TypeScript. All types are exported from `src/types/types.ts` and can be imported for use in your code:

```typescript
import type { Plant, Device, DeviceTotalData } from "./types/types";
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Disclaimer

This library is an unofficial client for the Growatt monitoring platform. Use at your own risk and ensure compliance with Growatt's terms of service.
