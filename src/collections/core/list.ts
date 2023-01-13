// shortcuts: list
// desc: the commands table
import fs from 'fs-extra';
import { indexJsonPath } from '../../cli/paths';

const start = async () => {
    const commands = fs.readJSONSync(indexJsonPath);

    const data = Object.keys(commands)
        .map((commandId) => {
            const command = commands[commandId],
                { collection, shortcuts, description } = command;

            return {
                collection,
                command: shortcuts.sort().join(', '),
                description,
            };
        })
        .filter((a) => a.command)
        .sort((a, b) => {
            if (a.collection < b.collection) return -1;
            if (a.collection > b.collection) return 1;
            if (a.command === b.command) return 0;
            return a.command > b.command ? 1 : -1;
        });

    console.table(data);
};

start();
