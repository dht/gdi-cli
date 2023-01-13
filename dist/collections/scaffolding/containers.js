"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: cont
// desc: generates containers for the component directory
const fs_extra_1 = __importDefault(require("fs-extra"));
const globby_1 = __importDefault(require("globby"));
const argv_1 = require("../../utils/argv");
const chalk_1 = __importDefault(require("chalk"));
const lodash_1 = require("lodash");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const grep = argv._[0];
const onlyPages = argv.pages;
console.log(chalk_1.default.magenta(cwd));
if (grep) {
    console.log(chalk_1.default.yellow(`grep: ${grep}`));
}
console.log(chalk_1.default.yellow(`mode: ${onlyPages ? 'pages' : 'components'}`));
const src = fs_extra_1.default.existsSync(`${cwd}/src`) ? 'src/' : '/';
const COMPONENTS_ROOT = onlyPages ? `${cwd}/${src}pages` : `${cwd}/${src}components`; // prettier-ignore
const CONTAINERS_ROOT = `${cwd}/${src}containers`;
const CONFIG_WIDGETS = `${cwd}/${src}config/widgets.tsx`;
const CONFIG_INSTANCES = `${cwd}/${src}config/instances.ts`;
const CONFIG_ROUTES = `${cwd}/${src}config/routes.ts`;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_extra_1.default.pathExistsSync(CONTAINERS_ROOT)) {
        console.log(`could not find path ${src}containers`);
        return;
    }
    const componentNames = globby_1.default
        .sync(`*`, { cwd: COMPONENTS_ROOT, onlyDirectories: true })
        .filter((i) => i.includes(grep) || !grep);
    componentNames.forEach((directory) => createContainerForComponent(directory));
    const widgets = findWidgetsInConfig();
    const widgetsNames = widgets.map((i) => i.widgetName);
    const missingWidgets = componentNames.filter((i) => !widgetsNames.includes(i));
    const appName = getAppName();
    missingWidgets.forEach((widgetName) => {
        addWidget(appName, widgetName);
    });
});
function createContainerForComponent(name) {
    logName(name);
    const dest = `${CONTAINERS_ROOT}/${name}Container.tsx`;
    if (fs_extra_1.default.existsSync(dest)) {
        logExists();
    }
    else {
        const content = template(name);
        fs_extra_1.default.writeFileSync(dest, content);
        logCreated();
    }
}
function addWidget(appName, widgetName) {
    logName(widgetName, 'adding widget for');
    let widgetsContent = fs_extra_1.default.readFileSync(CONFIG_WIDGETS).toString();
    widgetsContent = widgetsContent.replace(/enum [a-z]+Widgets {/gim, `enum ${appName}Widgets {
    ${widgetName} = '${appName.toLowerCase()}.${widgetName}',`);
    widgetsContent = widgetsContent.replace('export const widgets: IWidget[] = [', `export const widgets: IWidget[] = [\n${templateWidget(appName, widgetName)}`);
    widgetsContent = widgetsContent.replace("import React from 'react';", `import React from 'react';\n
const ${widgetName}Container =  React.lazy(() => import('../containers/${widgetName}Container')); // prettier-ignore`);
    fs_extra_1.default.writeFileSync(CONFIG_WIDGETS, widgetsContent);
    logWidgetAdded();
    logName(widgetName, 'adding route for');
    let routesContent = fs_extra_1.default.readFileSync(CONFIG_ROUTES).toString();
    const routeValue = (0, lodash_1.lowerFirst)(widgetName);
    routesContent = routesContent.replace('export const routes: IRoutes = {', `export const routes: IRoutes = {
    ${routeValue}: \`\$\{ROOT\}/${routeValue}\`,`);
    routesContent = routesContent.replace('export const menuItems: IMenuItem[] = [', `export const menuItems: IMenuItem[] = [
${templateMenuItem(widgetName)}`);
    fs_extra_1.default.writeFileSync(CONFIG_ROUTES, routesContent);
    logRouteAdded();
    logName(widgetName, 'adding instance for');
    let instancesContent = fs_extra_1.default.readFileSync(CONFIG_INSTANCES).toString();
    instancesContent = instancesContent.replace(/};/gim, `${templateInstance(appName, widgetName)}
};`);
    fs_extra_1.default.writeFileSync(CONFIG_INSTANCES, instancesContent);
    logInstanceAdded();
}
const logName = (componentName, verb = 'found') => process.stdout.write(`${verb} ${chalk_1.default.cyan(componentName)}... `); // prettier-ignore
const logExists = () => console.log(`${chalk_1.default.yellow('exists, skipping...')}`);
const logCreated = () => console.log(`${chalk_1.default.green('container created, OK')}`);
const logWidgetAdded = () => console.log(`${chalk_1.default.green('added, OK')}`);
const logRouteAdded = () => console.log(`${chalk_1.default.green('added, OK')}`);
const logInstanceAdded = () => console.log(`${chalk_1.default.green('added, OK')}`);
const template = (componentName) => `import React from 'react';
import ${componentName} from '../${onlyPages ? 'pages' : 'components'}/${componentName}/${componentName}';
import { useSelector, useDispatch } from 'react-redux';
import { selectors } from '../store';

export const ${componentName}Container = () => {
    return <${componentName} />;
};

export default ${componentName}Container;
`;
const templateWidget = (appName, widgetName) => `    {
        id: ${appName}Widgets.${widgetName},
        name: '${widgetName}',
        description: '${widgetName}',
        defaultDimension: {
            y: 16,
            x: 12,
        },
        component: (props: any) => <Wrapper
            appId={APP_ID}
            component={${widgetName}Container}
            props={props}
         />
    },`;
const templateInstance = (appName, widgetName) => `    ${(0, lodash_1.lowerFirst)(widgetName)}: [
        {
            id: '${widgetName}',
            widgetId: ${appName}Widgets.${widgetName},
            position: { y: 1, x: 10 },
            dimension: { y: 48, x: 88 },
        },
    ]`;
const templateMenuItem = (widgetName) => `  {
        path: routes.${(0, lodash_1.lowerFirst)(widgetName)},
        icon: 'Color',
        label: '${widgetName}',
        groupId: 'site',
        showOnSlim: true,
        order: 0,
    },`;
const findMatches = (content, regex) => {
    let matches = [], match;
    while ((match = regex.exec(content))) {
        matches.push(match[1]);
    }
    return matches;
};
const findWidgetsInConfig = () => {
    const widgetsContent = fs_extra_1.default.readFileSync(CONFIG_WIDGETS).toString();
    const instancesContent = fs_extra_1.default.readFileSync(CONFIG_INSTANCES).toString();
    const widgetsRegex = /export enum [a-z]+Widgets {([^}]+)}/gim;
    const widgetsRaw = findMatches(widgetsContent, widgetsRegex);
    return findMatches(widgetsRaw[0], /([a-zA-Z]+) *=/gim).map((widgetName) => {
        const widgetExists = widgetsContent.includes(`<${widgetName}`);
        const instanceExists = instancesContent.includes(`Widgets.${widgetName}`);
        return {
            widgetName,
            widgetExists,
            instanceExists,
        };
    });
};
const getAppName = () => {
    const widgetsContent = fs_extra_1.default.readFileSync(CONFIG_WIDGETS).toString();
    const appNameRegex = /export enum ([a-z]+)Widgets {([^}]+)}/gim;
    const match = appNameRegex.exec(widgetsContent);
    if (!match) {
        throw new Error('Could not find app name');
    }
    return match[1];
};
run();
