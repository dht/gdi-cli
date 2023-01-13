import { homedir } from 'os';

export const CLI_DB_PATH = '~/.gli-cli/db.json'.replace('~', homedir());
