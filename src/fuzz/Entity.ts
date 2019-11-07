export class Entity {
    private _id: string;
    private _uid: string;

    constructor(id: string, uid: string) {
        this._id = id;
        this._uid = uid;
    }

    get id() {
        return this._id;
    }

    get uid() {
        return this._uid;
    }

    _assert(value: boolean, message: string) {
        if (!value) {
            throw new Error(message);
        }
    }
}