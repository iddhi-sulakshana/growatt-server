interface ParseResult {
    success: boolean;
    msg?: string | number;
    param1?: number | boolean | string;
    param2?: number | boolean | string;
    param3?: number | boolean | string;
    param4?: number | boolean | string;
    param5?: number | boolean | string;
    param6?: number | boolean | string;
    param7?: number | boolean | string;
    param8?: number | boolean | string;
    param9?: number | boolean | string;
    param10?: number | boolean | string;
    param11?: number | boolean | string;
    param12?: number | boolean | string;
    param13?: number | boolean | string;
    param14?: number | boolean | string;
    param15?: number | boolean | string;
    param16?: number | boolean | string;
    param17?: number | boolean | string;
    param18?: number | boolean | string;
}

type ResolveCallback = (val: ParseResult) => void;

function fTime(val: number, ok: boolean): [string, boolean] {
    const H = val >> 8;
    const M = val & 255;

    return [
        `${`00${H}`.slice(-2)}:${`00${M}`.slice(-2)}`,
        ok && ((H >= 0 && H <= 23) || M >= 0 || M <= 59),
    ];
}

function fBool(val: number, ok: boolean): [boolean, boolean] {
    return [val === 1, ok && val >= 0 && val <= 1];
}

function fNum(
    val: number,
    min: number,
    max: number,
    ok: boolean
): [number, boolean] {
    const r = parseInt(val.toString(), 10);
    return [r, ok && r >= min && r <= max];
}

function fDate(val: string | number, ok: boolean): [number, boolean] {
    const ar = val
        .toString()
        .split("-")
        .map((n) => parseInt(n, 10));
    try {
        return [
            new Date(ar[0], ar[1] - 1, ar[2], ar[3], ar[4], ar[5]).getTime(),
            ok,
        ];
        /* eslint-disable-next-line no-unused-vars */
    } catch (Error) {
        return [0, false];
    }
}

export default class {
    static parseRetDate(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            [val.param1, val.success] = fDate(val.msg, val.success);
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseBatteryFirst(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            const ar = val.msg
                .toString()
                .split("-")
                .map((n) => parseInt(n, 10));
            if (ar.length > 18) {
                let time = "";
                [val.param1, val.success] = fNum(ar[0], 0, 100, val.success);
                [val.param2, val.success] = fNum(ar[1], 0, 100, val.success);
                [val.param3, val.success] = fBool(ar[2], val.success);
                [time, val.success] = fTime(ar[10], val.success);
                [val.param4, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param5, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[11], val.success);
                [val.param6, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param7, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param8, val.success] = fBool(ar[12], val.success);
                [time, val.success] = fTime(ar[13], val.success);
                [val.param9, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param10, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[14], val.success);
                [val.param11, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param12, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param13, val.success] = fBool(ar[15], val.success);
                [time, val.success] = fTime(ar[16], val.success);
                [val.param14, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param15, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[17], val.success);
                [val.param16, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param17, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param18, val.success] = fBool(ar[18], val.success);
            } else {
                val.success = false;
            }
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseTLXHTimeSlot(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            const ar = val.msg
                .toString()
                .split("-")
                .map((n) => parseInt(n, 10));
            if (ar.length > 1) {
                let time = "";
                [val.param1, val.success] = fNum(
                    (ar[0] >> 13) & 0x03,
                    0,
                    2,
                    val.success
                );
                [time, val.success] = fTime(ar[0] & 0x1fff, val.success);
                [val.param2, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param3, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[1], val.success);
                [val.param4, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param5, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param6, val.success] = fBool(ar[0] >> 15, val.success);
            } else {
                val.success = false;
            }
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseGritFirst(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            const ar = val.msg
                .toString()
                .split("-")
                .map((n) => parseInt(n, 10));
            if (ar.length > 18) {
                let time = "";
                [val.param1, val.success] = fNum(ar[0], 0, 100, val.success);
                [val.param2, val.success] = fNum(ar[1], 0, 100, val.success);
                [time, val.success] = fTime(ar[10], val.success);
                [val.param3, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param4, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[11], val.success);
                [val.param5, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param6, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param7, val.success] = fBool(ar[12], val.success);
                [time, val.success] = fTime(ar[13], val.success);
                [val.param8, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param9, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[14], val.success);
                [val.param10, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param11, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param12, val.success] = fBool(ar[15], val.success);
                [time, val.success] = fTime(ar[16], val.success);
                [val.param13, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param14, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [time, val.success] = fTime(ar[17], val.success);
                [val.param15, val.success] = fNum(
                    parseInt(time.substring(0, 2), 10),
                    0,
                    24,
                    val.success
                );
                [val.param16, val.success] = fNum(
                    parseInt(time.substring(3, 6), 10),
                    0,
                    60,
                    val.success
                );
                [val.param17, val.success] = fBool(ar[18], val.success);
            } else {
                val.success = false;
            }
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseRetNum(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            [val.param1, val.success] = fNum(
                parseInt(val.msg.toString(), 10),
                0,
                100,
                val.success
            );
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseRetNum2div10(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            [val.param2, val.success] = fNum(
                parseInt(val.msg.toString(), 10) / 10,
                0,
                100,
                val.success
            );
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseRetBool(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            [val.param1, val.success] = fBool(
                parseInt(val.msg.toString(), 10),
                val.success
            );
        } else {
            val.success = false;
        }
        resolve(val);
    }

    static parseRetBoot(val: ParseResult, resolve: ResolveCallback): void {
        if (val.success === true && val.msg) {
            [val.param1, val.success] = fNum(
                parseInt(val.msg.toString(), 10),
                0,
                1,
                val.success
            );
        } else {
            val.success = false;
        }
        resolve(val);
    }
}
