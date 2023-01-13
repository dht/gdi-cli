// shortcuts: st
// desc: add a style component tag
import fs from 'fs-extra';
import { parseArgv } from '../../utils/argv';
import { upperFirst } from 'lodash';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const projectId = argv._[0];
const componentId = upperFirst(argv._[1]);
const tagNames = argv._[2].split(',').map((i: string) => i.trim());
const layoutPath = `${cwd}/.layout.json`;

const run = async () => {
    if (!fs.existsSync(layoutPath)) {
        console.log(`could not find .layout.json`);
        return;
    }

    const layout = fs.readJsonSync(`${cwd}/.layout.json`);
    const projectConfig = layout[projectId];

    if (!projectConfig) {
        console.log(
            `could not find configuration in .layout.json for ${projectId}`
        );
        return;
    }

    const { path } = projectConfig;
    const componentPath = `${cwd}/${path}/${componentId}/${componentId}.tsx`;
    const componentStylePath = `${cwd}/${path}/${componentId}/${componentId}.style.tsx`;

    if (!fs.existsSync(componentPath)) {
        console.log(`could not find component in ${componentPath}`);
        return;
    }

    if (!fs.existsSync(componentStylePath)) {
        console.log(`could not find component style in ${componentStylePath}`);
        return;
    }

    let content = fs.readFileSync(componentPath).toString();
    let contentStyle = fs.readFileSync(componentStylePath).toString();

    let match;

    const regexImport = new RegExp(
        `import {([^}]+)} from '\.\/${componentId}\.style';`,
        'gm'
    );

    match = regexImport.exec(content);
    if (!match) {
        console.log('cannot find style imports');
        return;
    }

    const tagsImport = tagNames.join(', ');
    content = content.replace(match[1], `${match[1]}, ${tagsImport} `);

    const regexContainer = /\<Container[^>]*>/m;

    match = regexContainer.exec(content);

    if (!match) {
        console.log('cannot find container tag in component');
        return;
    }

    const tagsContent = tagNames
        .map((i: string) => `<${i}>${i}</${i}>`)
        .join('\n');

    content = content.replace(match[0], `${match[0]}\n${tagsContent}`);

    const tagsStyle = tagNames
        .map((i: string) => `export const ${i} = styled.div\`\`;`)
        .join('\n\n');

    contentStyle += `\n\n${tagsStyle}`;

    fs.writeFileSync(componentPath, content);
    fs.writeFileSync(componentStylePath, contentStyle);
};

run();
