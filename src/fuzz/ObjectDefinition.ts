import { Type } from "./Type";
import { Entity } from "./Entity";

export class PropertyDefinition extends Entity {
    private _type: Type;
    private _defaultValue: Entity;

    constructor(id: string, uid: string, type: Type, defaultValue: Entity) {
        super(id, uid);
        this._assert(type.domain.values.indexOf(defaultValue) !== -1, "Default value must be a value of Type: " + type.id);
        this._type = type;
        this._defaultValue = defaultValue || this._type.defaultValue;
    }

    get type() {
        return this._type;
    }

    get defaultValue() {
        return this._defaultValue;
    }
}

export class ObjectDefinition extends Entity {
    private _properties: PropertyDefinition[];

    constructor(id: string, uid: string, properties: PropertyDefinition[]) {
        super(id, uid);
        this._properties = properties;
    }

    get properties() {
        return this._properties;
    }
}