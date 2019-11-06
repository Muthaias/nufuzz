class Entity {
    constructor(id, uid) {
        this._id = id;
        this._uid = uid;
    }

    get id() {
        return this._id;
    }

    get uid() {
        return this._uid;
    }

    _assert(value, message) {
        if (!value) {
            throw new Error(message);
        }
    }
}

class Value extends Entity {
}

class Domain extends Entity {
    constructor(id, uid, values) {
        super(id, uid);
        this._assert(
            Array.isArray(values) && !values.some(value => !(value instanceof Entity)),
            "Type mismatch. All values of domain must be instance of Entity."
        );
        this._values = values;
    }

    get values() {
        return this._values;
    }
}

class Type extends Entity {
    constructor(id, uid, domain, defaultValue) {
        super(id, uid);
        defaultValue = defaultValue || domain.values[0];
        this._assert(domain instanceof Domain, "Type mismatch. The domain must be instance of Domain.");
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

class TableColumn extends Entity {
    constructor(id, uid, index, domain) {
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

class Table extends Entity {
    constructor(id, uid, columns, data) {
        super(id, uid);
        this._assert(!columns.some(c => !(c instanceof TableColumn)), "Type mismatch. All columns need to be instancesof TableColumn.");
        if (data.length > 0) {
            this._assert(
                !columns.some(c => data[0][c.index] === undefined),
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

    columnData(column) {
        this._assert(this._columns.indexOf(column) !== -1, "The given column does not exist in this table.");
        return this._data.map(row => row[column.index]);
    }
}

class PropertyDefinition extends Entity {
    constructor(id, uid, type, defaultValue) {
        super(id, uid);
        this._assert(type instanceof Type, "Type mismatch. Type needs to be an instance of Type.");
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

class ObjectDefinition extends Entity {
    constructor(id, uid, properties) {
        super(id, uid);
        this._assert(
            Array.isArray(properties) && !properties.some(prop => !(prop instanceof PropertyDefinition || prop instanceof ObjectDefinition)),
            "Type mismatch. All values of properties must be instance of PropertyDefinition or ObjectDefinition."
        );
        this._properties = properties;
    }

    get properties() {
        return this._properties;
    }
}

class Context {
    constructor(base) {
        this._base = base;
        this._entityMap = new Map();
    }

    register(createCallback) {
        const uid = this.allocateUid();
        const value = createCallback(uid);
        this._entityMap.set(uid, value);
        return value;
    }

    registerUnique(match, createCallback) {
        for (const v of this._entityMap.values()) {
            if (match(v)) {
                return v;
            }
        }
        return this.register(createCallback);
    }

    allocateUid() {
        let ticker = 0;
        let uid = undefined;
        while (uid === undefined || this._entityMap.get(uid) !== undefined) {
            uid = this._btoa("" + this._base + ":" + Date.now() + ":" + ticker);
            ticker++;
        }
        this._entityMap.set(uid, null);
        return uid;
    }

    _btoa(data) {
        return Buffer.from(data, "binary").toString("base64");
    }
}

class Builder {
    static fromBase(base) {
        return new Builder(new Context(base));
    }

    constructor(context) {
        this._context = context;
    }

    value(id) {
        return this._context.registerUnique(
            (v) => v instanceof Value && v.id === id,
            (uid) => new Value(id, uid)
        );
    }

    values(...valueIds) {
        return valueIds.map(id => this.value(id));
    }

    domain(id, values) {
        return this._context.registerUnique(
            (v) => v instanceof Domain && v.id === id,
            (uid) => new Domain(id, uid, values)
        );
    }

    type(id, domain, defaultValue) {
        return this._context.registerUnique(
            (v) => v instanceof Type && v.id === id,
            (uid) => new Type(id, uid, domain, defaultValue)
        );
    }

    property(id, type, defaultValue) {
        return this._context.registerUnique(
            (v) => v instanceof PropertyDefinition && v.id === id,
            (uid) => new PropertyDefinition(id, uid, type, defaultValue || type.defaultValue)
        );
    }

    object(id, properties) {
        return this._context.registerUnique(
            (v) => v instanceof ObjectDefinition && v.id === id,
            (uid) => new ObjectDefinition(id, uid, properties)
        );
    }

    tableColumn(id, index, domain) {
        return this._context.register(
            (uid) => new TableColumn(id, uid, index, domain)
        );
    }

    table(id, columns, data) {
        return this._context.register(
            (uid) => new Table(id, uid, columns, data)
        );
    }

    union(domainA, domainB) {
        const a = this._arrayFromDomain(domainA);
        const b = this._arrayFromDomain(domainB);
        return [
            ...a,
            ...b,
        ];
    }

    intersect(domainA, domainB) {
        const union = this.union(domainA, domainB);
        return union.filter(value => union.filter(v => v === value).length > 1);
    }

    exclude(domainA, domainB) {
        const a = this._arrayFromDomain(domainA);
        const b = this._arrayFromDomain(domainB);
        return a.filter(v => b.indexOf(v) === -1);
    }

    combine(...itemGroups) {
        if (itemGroups.length > 1) {
            const a = itemGroups[0];
            const b = itemGroups[1];
            return this.combine(a.reduce((acc, itemA) => {
                const combo = [].concat(itemA);
                for (const itemB of b) {
                    acc.push(combo.concat(itemB));
                }
                return acc;
            }, []), ...itemGroups.slice(2));
        } else {
            return itemGroups.length > 0 ? itemGroups[0] : [];
        }
    }

    nufuzz() {
        return {
            v: this.value.bind(this),
            vs: this.values.bind(this),
            d: this.domain.bind(this),
            t: this.type.bind(this),
            p: this.property.bind(this),
            o: this.object.bind(this),
            tt: this.table.bind(this),
            tc: this.tableColumn.bind(this),
        };
    }

    calc() {
        return {
            or: this.union.bind(this),
            and: this.intersect.bind(this),
            x: this.exclude.bind(this),
            comb: this.combine.bind(this),
        };
    }

    _arrayFromDomain(domain) {
        return Array.isArray(domain) ? domain : domain.values;
    }
}

module.exports = {
    Builder,
};