import { Entity } from "./Entity";
import { Domain } from "./Domain";

export class Type extends Entity {
    private _domain: Domain;
    private _defaultValue: Entity;
    constructor(id: string, uid: string, domain: Domain, defaultValue: Entity) {
        super(id, uid);
        defaultValue = defaultValue || domain.values[0];
        this._domain = domain;
        this._assert(domain.values.indexOf(defaultValue) !== -1, "Default value must be inside ");
        this._defaultValue = defaultValue;
    }

    get domain() {
        return this._domain;
    }

    get defaultValue() {
        return this._defaultValue;
    }
}