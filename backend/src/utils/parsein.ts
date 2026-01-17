// Copyright (c) 2023 Träger
// TypeScript port of parsein utility

export default class PARSEIN {
    static INUM_0_100(val: number): [number, boolean] {
        return [val, Number.isInteger(val) && val >= 0 && val <= 100];
    }

    static INUM_0_24(val: number): [number, boolean] {
        return [val, Number.isInteger(val) && val >= 0 && val <= 24];
    }

    static INUM_0_60(val: number): [number, boolean] {
        return [val, Number.isInteger(val) && val >= 0 && val <= 60];
    }

    static INUM_0_1(val: number): [number, boolean] {
        return [val, Number.isInteger(val) && val >= 0 && val <= 1];
    }

    static INUM_0_2(val: number): [number, boolean] {
        return [val, Number.isInteger(val) && val >= 0 && val <= 2];
    }

    static BOOL(val: boolean): [number, boolean] {
        return [val === true ? 1 : 0, val === false || val === true];
    }

    static STIME_H_MIN(val: string): [string, boolean] {
        return [val, /^(2[0-3]|[01][0-9]):([0-5][0-9])$/.test(val)];
    }

    static DATETIME(val: Date | string): [string, boolean] {
        try {
            const d = new Date(val);
            const year = `000${d.getFullYear()}`.slice(-4);
            const month = `0${d.getMonth() + 1}`.slice(-2);
            const day = `0${d.getDate()}`.slice(-2);
            const hour = `0${d.getHours()}`.slice(-2);
            const minute = `0${d.getMinutes()}`.slice(-2);
            const secunde = `0${d.getSeconds()}`.slice(-2);
            const res = `${year}-${month}-${day} ${hour}:${minute}:${secunde}`;
            return [
                res,
                /^[0-9][0-9][0-9][0-9]-(1[0-2]|0[1-9])-(3[0-1]|[0-2][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])$/.test(
                    res
                ),
            ];
        } catch {
            return ["", false];
        }
    }
}
