import { Entity } from "./Entity";
import { Domain } from "./Domain";

export class TableColumn extends Entity {
    private _domain: Domain;
    private _index: string | number;

    constructor(id: string, uid: string, index: string | number, domain: Domain) {
        super(id, uid);
        this._domain = domain;
        this._index = index;
    }

    get domain() {
        return this._domain;
    }

    get index() {
        return this._index;
    }
}

export type TableData = Entity[][] | {[x: string]: Entity}[];

export class Table extends Entity {
    private _columns: TableColumn[];
    private _data: TableData;
    
    constructor(id: string, uid: string, columns: TableColumn[], data: TableData) {
        super(id, uid);
        if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            this._assert(
                !columns.some(c => (Array.isArray(row) ? row[c.index as number] : row[c.index as string]) === undefined),
                "The data is missing columns."
            )
        }
        this._columns = columns;
        this._data = data;
    }

    get data() {
        return this._data;
    }

    get columns() {
        return this._columns;
    }

    columnData(column: TableColumn) {
        this._assert(this._columns.indexOf(column) !== -1, "The given column does not exist in this table.");
        return (this._data as Entity[][]).map(row => row[column.index as number]);
    }
}