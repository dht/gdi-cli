// shortcuts: create
// desc: generates scaffolding for fs and data
import chalk from 'chalk';
import { scaffoldingVerbs } from '../../config/scaffoldingVerbs';
import middlewaresByEntityTypes from '../../middlewares';
import { middlewares as midBase } from '../../middlewares/midBase';
import { parseArgv } from '../../utils/argv';
import { Streamer } from '../../utils/streamer';

const argv = parseArgv(process.argv);

type ValidTypes = 'app' | 'web' | 'package' | 'component';

const entityType = argv._[0] as ValidTypes;
const isScaffolding = scaffoldingVerbs[entityType];

const midTemplate = middlewaresByEntityTypes.create[entityType];

if (!midTemplate) {
    console.log(chalk.red(`could not find template for "${entityType}"`));
    process.exit();
}

const names = [...argv._].splice(1);

names.forEach((name) => {
    const _: string[] = [entityType, name];

    const newArgv = {
        ...argv,
        _,
    };

    const stream = new Streamer(newArgv);
    stream.use(midBase.input());
    stream.use(midTemplate.preRun());
    stream.use(midBase.scanTemplateFiles({ skip: !isScaffolding }));
    stream.use(midTemplate.parseInstructions());
    stream.use(midBase.writeFiles({ skip: !isScaffolding }));
    stream.use(midTemplate.postRun());
    stream.run();
});
