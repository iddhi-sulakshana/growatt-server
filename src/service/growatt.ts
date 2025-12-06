import Axios, { type AxiosInstance } from "axios";
import ENV from "../utils/ENV";
import MD5 from "md5";
import type {
    Device,
    DeviceHistoryData,
    DeviceHistoryDataList,
    Devices,
    DeviceStatusData,
    DeviceTotalData,
    FaultLog,
    Plant,
    PlantDetails,
    Weather,
} from "../types/types";
import GROWATTTYPE from "../types/growatt.types";

export default class Growatt {
    private axios: AxiosInstance;
    private index: "index" | "indexbC" = "index";
    private connected: boolean = false;
    private cookie: string | null = null;
    private sessionId: string | null = null;

    constructor() {
        this.axios = Axios.create({
            baseURL: ENV.GROWATT_SERVER,
            timeout: 60000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                Connection: "keep-alive",
            },
        });
    }

    public async login() {
        this.reset();

        const params = new URLSearchParams({
            account: ENV.GROWATT_USERNAME,
            password: "",
            validateCode: "",
            isReadPact: "0",
            passwordCrc: MD5(ENV.GROWATT_PASSWORD),
        });

        const response = await this.axios.post("/login", params.toString());
        if (response.status !== 200 || !response.data) {
            console.error("Login failed: Unknown error");
            return;
        }
        if (response.data.result !== 1) {
            console.error(
                "Login failed: " + response.data.msg || "Unknown error"
            );
            return;
        }
        this.connected = true;
        this.cookie = response.headers["set-cookie"]?.join(";") || "";
        this.setSessionId();
        console.log("Login successful");
    }

    public async logout() {
        if (!this.connected || !this.sessionId || !this.cookie) {
            console.log("Not connected to the server");
            return;
        }
        await this.axios.get("/logout", {
            headers: this.makeCallHeaders(),
        });
        this.reset();
        console.log("Logout successful");
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async getPlantList(): Promise<Plant[]> {
        try {
            const response = await this.axios.post(
                `/${this.index}/getPlantListTitle`,
                null,
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error("Get plant list failed: Unknown error");
                return [];
            }
            return response.data;
        } catch (error) {
            console.error("Get plant list failed: " + error);
            return [];
        }
    }

    public async getPlantData(plantId: string): Promise<PlantDetails | null> {
        try {
            const params = new URLSearchParams({ plantId });
            const response = await this.axios.post(
                "/panel/getPlantData",
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error("Get plant data failed: Unknown error");
                return null;
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get plant data failed: " + response.data.msg ||
                        "Unknown error"
                );
                return null;
            }
            if (response.data.obj) {
                return response.data.obj as PlantDetails;
            }
            return null;
        } catch (error) {
            console.error("Get plant data failed: " + error);
            return null;
        }
    }

    public async getWeatherByPlantId(plantId: string): Promise<Weather | null> {
        try {
            const params = new URLSearchParams({ plantId });
            const response = await this.axios.post(
                `/${this.index}/getWeatherByPlantId`,
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error("Get weather by plant id failed: Unknown error");
                return null;
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get weather by plant id failed: " + response.data.msg ||
                        "Unknown error"
                );
                return null;
            }
            return response.data.obj as Weather;
        } catch (error) {
            console.error("Get weather by plant id failed: " + error);
            return null;
        }
    }

    public async getNewPlantFaultLog({
        plantId,
        date = "",
        deviceSn = "",
        toPageNum = 1,
    }: {
        plantId: string;
        date: string;
        deviceSn: string;
        toPageNum: number;
    }): Promise<FaultLog | null> {
        try {
            const type =
                date === "" ? 4 : 4 - date.toString().split("-").length; // type = 1-day, 2-month, 3-year
            const params = new URLSearchParams({
                plantId,
                date, // can be empty, YYYY, YYYY-MM, YYYY-MM-DD
                deviceSn, // to filter by device serial number
                toPageNum: toPageNum.toString(), // page of the logs
                type: type.toString(),
            });
            const response = await this.axios.post(
                `/log/getNewPlantFaultLog`,
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.data.result !== 1) {
                console.error(
                    "Get new plant fault log failed: " + response.data.msg ||
                        "Unknown error"
                );
                return null;
            }
            if (response.data.obj) {
                return response.data.obj as FaultLog;
            }
            return null;
        } catch (error) {
            console.error("Get new plant fault log failed: " + error);
            return null;
        }
    }

    public async getDevicesOfPlant(plantId: string): Promise<Devices> {
        try {
            const params = new URLSearchParams({ plantId });
            const response = await this.axios.post(
                `/panel/getDevicesByPlant`,
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error("Get devices of plant failed: Unknown error");
                return [];
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get devices of plant failed: " + response.data.msg ||
                        "Unknown error"
                );
                return [];
            }
            if (response.data.obj && typeof response.data.obj === "object") {
                const devices: Devices = [];
                for (const key in response.data.obj) {
                    if (GROWATTTYPE[key as keyof typeof GROWATTTYPE]) {
                        devices.push(
                            ...response.data.obj[key].map((item: string[]) => [
                                key,
                                ...item,
                            ])
                        );
                    }
                }
                return devices;
            }
            return [];
        } catch (error) {
            console.error("Get devices of plant failed: " + error);
            return [];
        }
    }

    // Internal Class Methods

    private makeCallHeaders() {
        if (!this.connected) {
            return {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                // 'X-Requested-With': 'XMLHttpRequest',
                Connection: "keep-alive",
            };
        }
        return {
            cookie: this.cookie,
            Referer: `${ENV.GROWATT_SERVER}/${this.index};jsessionid=${this.sessionId}`,
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
            // 'X-Requested-With': 'XMLHttpRequest',
            Connection: "keep-alive",
        };
    }

    private setSessionId() {
        if (!this.cookie) return null;
        this.sessionId =
            this.cookie
                .split(";")
                .find((cookie) => cookie.includes("JSESSIONID"))
                ?.split("=")[1] || null;
    }

    private reset() {
        this.connected = false;
        this.cookie = "";
    }

    public getSerialNoOfDevice(device: Device): string {
        const [growattType, serialNo, serialNo2, invId] = device;
        let serialNr = serialNo;
        if (GROWATTTYPE[growattType].atIndex) {
            serialNr += `@${serialNo2}`;
        }
        return serialNr;
    }

    public async getPlantDeviceTotalData({
        plantId,
        device,
    }: {
        plantId: string;
        device: Device;
    }): Promise<DeviceTotalData | null> {
        try {
            const serialNo = this.getSerialNoOfDevice(device);
            const splitId = serialNo.split("_");
            const params =
                GROWATTTYPE[device[0]].addrParam &&
                GROWATTTYPE[device[0]].invIdParam
                    ? new URLSearchParams({
                          plantId,
                          [GROWATTTYPE[device[0]].snParam]: splitId[0],
                          [GROWATTTYPE[device[0]].addrParam as string]:
                              splitId[1],
                          [GROWATTTYPE[device[0]].invIdParam as string]:
                              device[3],
                      })
                    : new URLSearchParams({
                          plantId,
                          [GROWATTTYPE[device[0]].snParam]: serialNo,
                      });
            const response = await this.axios.post(
                GROWATTTYPE[device[0]].getTotalData,
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error(
                    "Get plant device total data failed: Unknown error"
                );
                return null;
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get plant device total data failed: " +
                        response.data.msg || "Unknown error"
                );
                return null;
            }
            return response.data.obj;
        } catch (error) {
            console.error("Get plant device total data failed: " + error);
            return null;
        }
    }

    public async getPlantDeviceStatusData({
        plantId,
        device,
    }: {
        plantId: string;
        device: Device;
    }): Promise<DeviceStatusData | null> {
        try {
            const serialNo = this.getSerialNoOfDevice(device);
            const splitId = serialNo.split("_");
            const params =
                GROWATTTYPE[device[0]].addrParam &&
                GROWATTTYPE[device[0]].invIdParam
                    ? new URLSearchParams({
                          plantId,
                          [GROWATTTYPE[device[0]].snParam]: splitId[0],
                          [GROWATTTYPE[device[0]].addrParam as string]:
                              splitId[1],
                          [GROWATTTYPE[device[0]].invIdParam as string]:
                              device[3],
                      })
                    : new URLSearchParams({
                          plantId,
                          [GROWATTTYPE[device[0]].snParam]: serialNo,
                      });
            const response = await this.axios.post(
                GROWATTTYPE[device[0]].getStatusData as string,
                params.toString(),
                {
                    headers: this.makeCallHeaders(),
                }
            );
            if (response.status !== 200 || !response.data) {
                console.error(
                    "Get plant device status data failed: Unknown error"
                );
                return null;
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get plant device status data failed: " +
                        response.data.msg || "Unknown error"
                );
                return null;
            }
            return response.data.obj;
        } catch (error) {
            console.error("Get plant device status data failed: " + error);
            return null;
        }
    }

    public async getPlantDeviceHistoryData({
        plantId,
        device,
        startDate,
        endDate,
        start,
    }: {
        plantId: string;
        device: Device;
        startDate: Date;
        endDate: Date;
        start: number;
    }): Promise<DeviceHistoryDataList | null> {
        try {
            const serialNo = this.getSerialNoOfDevice(device);
            const splitId = serialNo.split("_");
            const params = new URLSearchParams({
                plantId,
                [GROWATTTYPE[device[0]].snParam]: splitId[0],
                startDate: startDate.toISOString().substring(0, 10),
                endDate: endDate.toISOString().substring(0, 10),
                start: start.toString(),
            });
            const response = await this.axios.post(
                GROWATTTYPE[device[0]].getHistory as string,
                params.toString(),
                { headers: this.makeCallHeaders() }
            );
            if (response.status !== 200 || !response.data) {
                console.error(
                    "Get plant device history data failed: Unknown error"
                );
                return null;
            }
            if (response.data.result !== 1) {
                console.error(
                    "Get plant device history data failed: " +
                        response.data.msg || "Unknown error"
                );
                return null;
            }
            return response.data.obj;
        } catch (error) {
            console.error("Get plant device history data failed: " + error);
            return null;
        }
    }
}
