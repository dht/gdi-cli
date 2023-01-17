// shortcuts: staging
// desc: configure staging
import chalk from 'chalk';
import middlewaresByVerbs from '../../middlewares';
import { middlewares as midBase } from '../../middlewares/midBase';
import { parseArgv } from '../../utils/argv';
import { streamer } from '../../utils/streamer';

const argv = parseArgv(process.argv);

type ValidVerbs = 'config' | 'company' | 'user';

const entityType = argv._[0] as ValidVerbs;

const midTemplate = middlewaresByVerbs.staging[entityType];

if (!midTemplate) {
    console.log(chalk.red(`could not find template for "${entityType}"`));
    process.exit();
}

const stream = streamer(argv);

stream.use(midBase.input());
stream.use(midTemplate.preRun());
stream.use(midTemplate.parseInstructions());
stream.use(midBase.saveToCliDb());
stream.use(midTemplate.postRun());
stream.run();
