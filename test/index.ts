import { Builder } from "../src/fuzz";

const builder = Builder.fromBase("test");
const {v, vs, d, t, p, o, tt, tc} = builder.nufuzz();
const {or, and, x, comb} = builder.calc();

const domains = {
    first: d("first", vs(
        "a",
        "b",
        "c",
        "d",
        "e",
    )),
    second: d("second", vs(
        "f",
        "g",
        "h",
    )),
    third: d("third", vs(
        "i",
        "j",
        "k",
        "l",
        "m",
    )),
    fourth: d("fourth", vs(
        "1",
        "2",
        "3",
        "4",
        "5",
    ))
};

const valueList = x(or(domains.first, domains.third), [v("i"), v("a")]);
const combos = comb(domains.first.values, domains.third.values);
const nueCombo = comb(combos, [v("1"), v("2")]);
const table = tt("test-table", [
    tc("a", 0, domains.first),
    tc("b", 1, domains.second),
    tc("c", 2, domains.third),
], nueCombo);
console.log(table.columnData(table.columns[2]));
//console.log(nueCombo);
//console.log(valueList);

const types = {
    first: t("first", domains.first, v("a")),
    second: t("second", domains.second, v("f")),
    third: t("third", domains.third, v("j")),
    fourth: t("fourth", domains.fourth, v("1"))
};
