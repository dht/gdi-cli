// shortcuts: cont
// desc: generates containers for the component directory
import fs from 'fs-extra';
import globby from 'globby';
import { parseArgv } from '../../utils/argv';
import chalk from 'chalk';
import { lowerFirst } from 'lodash';

const argv = parseArgv(process.argv);
const { cwd } = argv;
const grep = argv._[0];
const onlyPages = argv.pages;

console.log(chalk.magenta(cwd));

if (grep) {
    console.log(chalk.yellow(`grep: ${grep}`));
}

console.log(chalk.yellow(`mode: ${onlyPages ? 'pages' : 'components'}`));

const src = fs.existsSync(`${cwd}/src`) ? 'src/' : '/';

const COMPONENTS_ROOT = onlyPages ? `${cwd}/${src}pages` : `${cwd}/${src}components`; // prettier-ignore
const CONTAINERS_ROOT = `${cwd}/${src}containers`;
const CONFIG_WIDGETS = `${cwd}/${src}config/widgets.tsx`;
const CONFIG_INSTANCES = `${cwd}/${src}config/instances.ts`;
const CONFIG_ROUTES = `${cwd}/${src}config/routes.ts`;

const run = async () => {
    if (!fs.pathExistsSync(CONTAINERS_ROOT)) {
        console.log(`could not find path ${src}containers`);
        return;
    }

    const componentNames = globby
        .sync(`*`, { cwd: COMPONENTS_ROOT, onlyDirectories: true })
        .filter((i) => i.includes(grep) || !grep);

    componentNames.forEach((directory) =>
        createContainerForComponent(directory)
    );

    const widgets = findWidgetsInConfig();
    const widgetsNames = widgets.map((i) => i.widgetName);

    const missingWidgets = componentNames.filter(
        (i) => !widgetsNames.includes(i)
    );

    const appName = getAppName();

    missingWidgets.forEach((widgetName) => {
        addWidget(appName, widgetName);
    });
};

function createContainerForComponent(name: string) {
    logName(name);

    const dest = `${CONTAINERS_ROOT}/${name}Container.tsx`;

    if (fs.existsSync(dest)) {
        logExists();
    } else {
        const content = template(name);
        fs.writeFileSync(dest, content);
        logCreated();
    }
}

function addWidget(appName: string, widgetName: string) {
    logName(widgetName, 'adding widget for');
    let widgetsContent = fs.readFileSync(CONFIG_WIDGETS).toString();

    widgetsContent = widgetsContent.replace(
        /enum [a-z]+Widgets {/gim,
        `enum ${appName}Widgets {
    ${widgetName} = '${appName.toLowerCase()}.${widgetName}',`
    );

    widgetsContent = widgetsContent.replace(
        'export const widgets: IWidget[] = [',
        `export const widgets: IWidget[] = [\n${templateWidget(
            appName,
            widgetName
        )}`
    );

    widgetsContent = widgetsContent.replace(
        "import React from 'react';",
        `import React from 'react';\n
const ${widgetName}Container =  React.lazy(() => import('../containers/${widgetName}Container')); // prettier-ignore`
    );

    fs.writeFileSync(CONFIG_WIDGETS, widgetsContent);
    logWidgetAdded();

    logName(widgetName, 'adding route for');
    let routesContent = fs.readFileSync(CONFIG_ROUTES).toString();

    const routeValue = lowerFirst(widgetName);

    routesContent = routesContent.replace(
        'export const routes: IRoutes = {',
        `export const routes: IRoutes = {
    ${routeValue}: \`\$\{ROOT\}/${routeValue}\`,`
    );

    routesContent = routesContent.replace(
        'export const menuItems: IMenuItem[] = [',
        `export const menuItems: IMenuItem[] = [
${templateMenuItem(widgetName)}`
    );

    fs.writeFileSync(CONFIG_ROUTES, routesContent);
    logRouteAdded();

    logName(widgetName, 'adding instance for');
    let instancesContent = fs.readFileSync(CONFIG_INSTANCES).toString();

    instancesContent = instancesContent.replace(
        /};/gim,
        `${templateInstance(appName, widgetName)}
};`
    );

    fs.writeFileSync(CONFIG_INSTANCES, instancesContent);
    logInstanceAdded();
}

const logName = (componentName: string, verb: string ='found') => process.stdout.write(`${verb} ${chalk.cyan(componentName)}... `); // prettier-ignore
const logExists = () => console.log(`${chalk.yellow('exists, skipping...')}`);
const logCreated = () => console.log(`${chalk.green('container created, OK')}`);
const logWidgetAdded = () => console.log(`${chalk.green('added, OK')}`);
const logRouteAdded = () => console.log(`${chalk.green('added, OK')}`);
const logInstanceAdded = () => console.log(`${chalk.green('added, OK')}`);

const template = (componentName: string) => `import React from 'react';
import ${componentName} from '../${
    onlyPages ? 'pages' : 'components'
}/${componentName}/${componentName}';
import { useSelector, useDispatch } from 'react-redux';
import { selectors } from '../store';

export const ${componentName}Container = () => {
    return <${componentName} />;
};

export default ${componentName}Container;
`;

const templateWidget = (appName: string, widgetName: string) => `    {
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

const templateInstance = (
    appName: string,
    widgetName: string
) => `    ${lowerFirst(widgetName)}: [
        {
            id: '${widgetName}',
            widgetId: ${appName}Widgets.${widgetName},
            position: { y: 1, x: 10 },
            dimension: { y: 48, x: 88 },
        },
    ]`;

const templateMenuItem = (widgetName: string) => `  {
        path: routes.${lowerFirst(widgetName)},
        icon: 'Color',
        label: '${widgetName}',
        groupId: 'site',
        showOnSlim: true,
        order: 0,
    },`;

const findMatches = (content: string, regex: RegExp) => {
    let matches = [],
        match;

    while ((match = regex.exec(content))) {
        matches.push(match[1]);
    }

    return matches;
};

type WidgetInfo = {
    widgetName: string;
    widgetExists: boolean;
    instanceExists: boolean;
};

const findWidgetsInConfig = (): WidgetInfo[] => {
    const widgetsContent = fs.readFileSync(CONFIG_WIDGETS).toString();
    const instancesContent = fs.readFileSync(CONFIG_INSTANCES).toString();
    const widgetsRegex = /export enum [a-z]+Widgets {([^}]+)}/gim;

    const widgetsRaw = findMatches(widgetsContent, widgetsRegex);

    return findMatches(widgetsRaw[0], /([a-zA-Z]+) *=/gim).map((widgetName) => {
        const widgetExists = widgetsContent.includes(`<${widgetName}`);
        const instanceExists = instancesContent.includes(
            `Widgets.${widgetName}`
        );

        return {
            widgetName,
            widgetExists,
            instanceExists,
        };
    });
};

const getAppName = () => {
    const widgetsContent = fs.readFileSync(CONFIG_WIDGETS).toString();

    const appNameRegex = /export enum ([a-z]+)Widgets {([^}]+)}/gim;
    const match = appNameRegex.exec(widgetsContent);

    if (!match) {
        throw new Error('Could not find app name');
    }

    return match[1];
};

run();
