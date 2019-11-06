const { Builder } = require("../fuzz");

const builder = Builder.fromBase("test");
const {v, vs, d, t, p, o} = builder.nufuzz();
const {or, and, x} = builder.calc();

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
    positions: d("position", vs(
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
console.log(valueList);

const types = {
    employee: t("employee", domains.employees, v("many")),
    position: t("position", domains.positions, v("developer")),
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
