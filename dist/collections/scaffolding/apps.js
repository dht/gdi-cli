"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// shortcuts: apps
// desc: regenerate apps package
const argv_1 = require("../../utils/argv");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const globby = __importStar(require("globby"));
const chalk_1 = __importDefault(require("chalk"));
const shared_base_1 = require("shared-base");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
let adminPath = path.resolve(cwd, 'clients/gdi-admin');
if (!fs.existsSync(adminPath)) {
    adminPath = path.resolve(cwd, 'gdi-admin');
    if (!fs.existsSync(adminPath)) {
        console.log(chalk_1.default.red('could not find "gdi-admin" folder'));
        process.exit();
    }
}
if (!fs.existsSync(`${adminPath}/src/extra`)) {
    fs.mkdirSync(`${adminPath}/src/extra`);
}
const outputFilePaths = {
    tsConfigExtra: path.resolve(adminPath, 'config/tsconfig.paths.extra.json'),
    viteExtra: path.resolve(adminPath, 'config/vite.extra.ts'),
    appsExtra: path.resolve(adminPath, 'src/extra/main.extra.ts'),
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const apps = scanForApps();
    const stores = scanForStores();
    let extraText = '';
    if (apps.all.length > 0) {
        console.log(`${chalk_1.default.yellow(apps.all.length)} extra apps available:`);
        extraText = 'with those apps';
    }
    apps.all.forEach((appName) => {
        console.log(`- ${chalk_1.default.magenta(appName)}`);
    });
    process.stdout.write(`generating ${chalk_1.default.cyan('main.apps.ts')} package${extraText}...`);
    const linesMain = appsToMainLines(apps.extra);
    fs.writeFileSync(outputFilePaths.appsExtra, templateInitializers(linesMain));
    const linesVite = appsAndStoresToLinesVite(apps.extra, stores.extra);
    fs.writeFileSync(outputFilePaths.viteExtra, templateVite(linesVite));
    const linesTsConfig = appsAndStoresToLinesTsConfig(apps.extra, stores.extra);
    fs.writeJsonSync(outputFilePaths.tsConfigExtra, {
        compilerOptions: {
            paths: linesTsConfig,
        },
    }, { spaces: 4 });
    console.log(chalk_1.default.green('done'));
});
const appsToMainLines = (apps) => {
    return apps.reduce((output, fullAppName) => {
        const appName = fullAppName.split('-').pop();
        const initVariableName = `init${(0, shared_base_1.upperFirst)(appName)}`;
        output.imports.push(`import { initApp as ${initVariableName} } from '@gdi/app-${appName}';`);
        output.initializers.push(`${appName}: ${initVariableName}`);
        return output;
    }, {
        imports: [],
        initializers: [],
    });
};
const appsAndStoresToLinesVite = (apps, stores) => {
    const output = {};
    apps.forEach((fullAppName) => {
        const key = `@gdi/${fullAppName}`;
        output[key] = `\`\${cwd}/extra/apps/${fullAppName}/src\``;
    });
    stores.forEach((fullStoreName) => {
        const key = `@gdi/${fullStoreName}`.replace(/gdi-/, '');
        output[key] = `\`\${cwd}/extra/stores/${fullStoreName}/src\``;
    });
    return output;
};
const appsAndStoresToLinesTsConfig = (apps, stores) => {
    const output = {};
    apps.forEach((fullAppName) => {
        const key = `@gdi/${fullAppName}`;
        output[key] = [`extra/apps/${fullAppName}`];
    });
    stores.forEach((fullStoreName) => {
        const key = `@gdi/${fullStoreName}`.replace(/gdi-/, '');
        output[key] = [`extra/stores/${fullStoreName}`];
    });
    return output;
};
const scanForApps = () => {
    const output = {
        base: [],
        extra: [],
        all: [],
    };
    output.base = globby.sync('*', {
        cwd: `${cwd}/apps`,
        onlyDirectories: true,
    });
    output.extra = globby.sync('*', {
        cwd: `${cwd}/extra/apps`,
        onlyDirectories: true,
    });
    output.all = [...output.base, ...output.extra];
    return output;
};
const scanForStores = () => {
    const output = {
        base: [],
        extra: [],
        all: [],
    };
    output.base = globby.sync('*', {
        cwd: `${cwd}/stores`,
        onlyDirectories: true,
    });
    output.extra = globby.sync('*', {
        cwd: `${cwd}/extra/stores`,
        onlyDirectories: true,
    });
    output.all = [...output.base, ...output.extra];
    return output;
};
const templateInitializers = (lines) => {
    const { imports, initializers } = lines;
    return (imports.join('\n') +
        `

export const initializersExtra = {
    ${initializers.join(',\n\t')}
};
`);
};
const templateVite = (map) => {
    return `import * as path from 'path';

const cwd = path.resolve(process.cwd(), '../../');

export const aliasExtra = {
    ${Object.keys(map)
        .map((key) => `'${key}': ${map[key]}`)
        .join(',\n\t')}
   
};
`;
};
run();
