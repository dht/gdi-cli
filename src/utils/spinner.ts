import chalk from 'chalk';
import { Spinner } from 'cli-spinner';
import readline from 'readline';

const spinner = new Spinner('%s');
spinner.setSpinnerString('⣾⣽⣻⢿⡿⣟⣯⣷');

let index = 0;

export const showSpinner = (message?: string) => {
    if (message) {
        spinner.setSpinnerTitle(`${message} %s`);
        index = message.length;
    } else {
        spinner.setSpinnerTitle('%s');
        index = 0;
    }

    spinner.start();
};

export const stopSpinner = (message: string = 'done') => {
    spinner.stop();
    readline.cursorTo(process.stdout, index + 1);
    console.log(chalk.green(message));
};
