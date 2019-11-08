import { Entity } from "./Entity";

export class Context {
    private _base: string;
    private _entityMap: Map<string, Entity>;

    constructor(base: string) {
        this._base = base;
        this._entityMap = new Map<string, Entity>();
    }

    register<T extends Entity>(createCallback: (uid: string) => T): T {
        const uid = this.allocateUid();
        const value = createCallback(uid);
        this._entityMap.set(uid, value);
        return value;
    }

    registerUnique<T extends Entity>(match: (e: T) => boolean, createCallback: (uid: string) => T): T {
        for (const v of this._entityMap.values()) {
            if (match(v as T)) {
                return v as T;
            }
        }
        return this.register<T>(createCallback);
    }

    allocateUid() {
        let ticker: number = 0;
        let uid: string | undefined = undefined;
        while (uid === undefined || this._entityMap.get(uid) !== undefined) {
            uid = this._btoa("" + this._base + ":" + Date.now() + ":" + ticker);
            ticker++;
        }
        this._entityMap.set(uid, null);
        return uid;
    }

    _btoa(data: string) {
        return Buffer.from(data, "binary").toString("base64");
    }
}