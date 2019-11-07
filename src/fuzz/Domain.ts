import { Entity } from "./Entity";

export class Domain extends Entity {
    private _values: Entity[];
    constructor(id: string, uid: string, values: Entity[]) {
        super(id, uid);
        this._values = values;
    }

    get values() {
        return this._values;
    }
}