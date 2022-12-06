import { run } from '../cli/cli';

let cwd: string = '';

export const setCwd = (value: string) => {
    cwd = value;
};

export type FirebaseResponse = {
    success: boolean;
    error?: string;
    data?: Json | Json[];
};

export const runCommand = async (
    command: string
): Promise<FirebaseResponse> => {
    const output: FirebaseResponse = {
        success: false,
    };

    const args = [command, '-j'];

    const responseRaw = await run('firebase', args, cwd);
    let response: Json = {};

    try {
        response = JSON.parse(responseRaw);
    } catch (_err) {}

    if (response.status === 'success') {
        output.success = true;
        output.data = response.result;
    } else {
        output.error = response.error;
    }

    return output;
};
