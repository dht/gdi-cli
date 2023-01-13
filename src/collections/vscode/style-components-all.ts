// shortcuts: st-all
// desc: add a style component tag
import fs from 'fs-extra';
import { parseArgv } from '../../utils/argv';
import { uniq } from 'lodash';
import chalk from 'chalk';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const projectId = argv._[0];

const run = async () => {
    const componentId = cwd.split('/').pop();

    const componentPath = `${cwd}/${componentId}.tsx`;
    const componentStylePath = `${cwd}/${componentId}.style.tsx`;

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

    const regexComponents = /\<([a-zA-Z0-9]+) ?\>/g;

    let tagNames: string[] = [];

    while ((match = regexComponents.exec(content))) {
        tagNames.push(match[1]);
    }
    tagNames = uniq(tagNames);

    match = regexImport.exec(content);
    if (!match) {
        console.log('cannot find style imports');
        return;
    }

    const tagsImport = tagNames.join(', ');
    content = content.replace(match[1], `${match[1]}, ${tagsImport} `);

    const tagsStyle = tagNames
        .map((i: string) => `export const ${i} = styled.div\`\`;`)
        .join('\n\n');

    contentStyle += `\n\n${tagsStyle}`;

    fs.writeFileSync(componentPath, content);
    fs.writeFileSync(componentStylePath, contentStyle);

    console.log(['added', chalk.cyan(tagNames.length), 'tags'].join(' '));
};

run();
