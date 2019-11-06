const { Builder } = require("../fuzz");

const builder = Builder.fromBase("test");
const {v, vs, d, t, p, o, tt, tc} = builder.nufuzz();
const {or, and, x, comb} = builder.calc();

const domains = {
    employees: d("employees", vs(
        "many",
        "aiab",
        "josv",
        "pewi",
        "joan",
        "josh",
        "dava",
        "jova",
    )),
    roles: d("position", vs(
        "developer",
        "project-leader",
        "product-owner",
        "cto",
        "hr",
        "ux-designer",
        "ui-designer",
    )),
    skills: d("skills", vs(
        "design",
        "scss",
        "typescript",
        "react",
        "php",
        "c#",
        "frontend",
        "backend",
    )),
    skillLevels: d("skill-levels", vs(
        "1",
        "2",
        "3",
        "4",
        "5",
    ))
};

const valueList = x(or(domains.employees, domains.skills), [v("c#"), v("react")]);
const combos = comb(domains.employees.values, domains.skills.values);
const nueCombo = comb(combos, [v("developer")]);
const table = tt("test-table", [
    tc("a", 0, domains.employees),
    tc("b", 1, domains.skills),
    tc("c", 2, domains.roles),
], nueCombo);
console.log(table.columnData(table.columns[2]));
//console.log(nueCombo);
//console.log(valueList);

const types = {
    employee: t("employee", domains.employees, v("many")),
    position: t("position", domains.roles, v("developer")),
    skill: t("skill", domains.skills, v("frontend")),
    skillLevels: t("skill-level", domains.skillLevels, v("1"))
};

const skill = o("skill", [
    p("skill", types.skill),
    p("level", types.skillLevels)
]);
const root = o("root", [
    p("employee", types.employee),
    p("position", types.position),
    p("skill", skill),
]);

//console.log(root);