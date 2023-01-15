import { Json, Middleware } from '../types';
import { Command } from './command';
import { isPromise } from './promise';

export class Streamer {
    private middlewares: Middleware[] = [];

    private command: Command | undefined;

    private index = 0;

    constructor(private argv: Json) {}

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    next = async () => {
        const nextMiddleware = this.middlewares[this.index++];

        if (!nextMiddleware) {
            return;
        }

        if (this.command) {
            const response = nextMiddleware(this.command, this.next);
            if (isPromise(response)) {
                await response;
            }
        }
    };

    clear() {
        this.index = 0;
    }

    run() {
        this.command = new Command(this.argv);
        this.clear();
        this.next();
    }
}
