import ENV from "./utils/ENV";
ENV.configEnvironment();

import Growatt from "./service/growatt";

async function test() {
    const growatt = new Growatt();
    await growatt.login();
    const plantList = await growatt.getPlantList();
    for (const plant of plantList) {
        const devices = await growatt.getDevicesOfPlant(plant.id);
        for (const device of devices) {
            const historyData = await growatt.getPlantDeviceHistoryData({
                plantId: plant.id,
                device,
                startDate: new Date("2025-12-03"),
                endDate: new Date("2025-12-03"),
                start: 0,
            });
            console.log(historyData?.datas[0]?.calendar);
        }
    }
    await growatt.logout();
}
test();
