import { Context } from "./Context";
import { Entity } from "./Entity";
import { Value } from "./Value";
import { Domain } from "./Domain";
import { Type } from "./Type";
import { Table, TableColumn } from "./Table";
import { ObjectDefinition, PropertyDefinition } from "./ObjectDefinition";

export class Builder {
    private _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    static fromBase(base: string) {
        return new Builder(new Context(base));
    }

    value(id: string) {
        return this._context.registerUnique(
            (v) => v instanceof Value && v.id === id,
            (uid) => new Value(id, uid)
        );
    }

    values(...valueIds: string[]) {
        return valueIds.map(id => this.value(id));
    }

    domain(id: string, values: Entity[]) {
        return this._context.registerUnique(
            (v) => v instanceof Domain && v.id === id,
            (uid) => new Domain(id, uid, values)
        );
    }

    type(id: string, domain: Domain, defaultValue: Entity) {
        return this._context.registerUnique(
            (v) => v instanceof Type && v.id === id,
            (uid) => new Type(id, uid, domain, defaultValue)
        );
    }

    property(id: string, type: Type, defaultValue: Entity) {
        return this._context.registerUnique(
            (v) => v instanceof PropertyDefinition && v.id === id,
            (uid) => new PropertyDefinition(id, uid, type, defaultValue || type.defaultValue)
        );
    }

    object(id: string, properties: PropertyDefinition[]) {
        return this._context.registerUnique(
            (v) => v instanceof ObjectDefinition && v.id === id,
            (uid) => new ObjectDefinition(id, uid, properties)
        );
    }

    tableColumn(id: string, index: string | number, domain: Domain) {
        return this._context.register(
            (uid) => new TableColumn(id, uid, index, domain)
        );
    }

    table(id: string, columns: TableColumn[], data: Entity[][]) {
        return this._context.register(
            (uid) => new Table(id, uid, columns, data)
        );
    }

    union(domainA: Domain | Entity[], domainB: Domain | Entity[]) {
        const a = this._arrayFromDomain(domainA);
        const b = this._arrayFromDomain(domainB);
        return [
            ...a,
            ...b,
        ];
    }

    intersect(domainA: Domain | Entity[], domainB: Domain | Entity[]) {
        const union = this.union(domainA, domainB);
        return union.filter(value => union.filter(v => v === value).length > 1);
    }

    exclude(domainA: Domain | Entity[], domainB: Domain | Entity[]) {
        const a = this._arrayFromDomain(domainA);
        const b = this._arrayFromDomain(domainB);
        return a.filter(v => b.indexOf(v) === -1);
    }

    combine(...itemGroups: (Entity | Entity[])[][]): Entity[][] {
        if (itemGroups.length > 1) {
            const a = itemGroups[0];
            const b = itemGroups[1];
            return this.combine(a.reduce<Entity[][]>((acc, itemA) => {
                const combo: Entity[] = [].concat(itemA);
                for (const itemB of b) {
                    acc.push(combo.concat(itemB));
                }
                return acc;
            }, []), ...itemGroups.slice(2));
        } else {
            return itemGroups.length > 0 ? [].concat(itemGroups[0]) : [];
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

    _arrayFromDomain(domain: Domain | Entity[]) {
        return Array.isArray(domain) ? domain : domain.values;
    }
}