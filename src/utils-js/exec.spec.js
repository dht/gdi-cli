const { exec, execSync } = require('./exec');

describe('execSync', () => {
    let response;

    it('return response', async () => {
        response = await execSync('pwd', [], '/');
        expect(response).toEqual('/');
    });

    it('return error', async () => {
        try {
            response = await execSync('foofoo', [], '.');
        } catch (err) {
            expect(err.message).toBe('spawnSync foofoo ENOENT');
        }
    });

    it('parallel', async () => {
        const promises = [
            execSync('pwd', [], '/'),
            execSync('pwd', [], '/'),
            execSync('pwd', [], '/'),
        ];

        const responses = await Promise.all(promises);

        expect(responses.length).toBe(3);
        responses.forEach((response) => {
            expect(response).toEqual('/');
        });
    });
});

describe('exec', () => {
    let response;

    it('return response', async () => {
        response = await exec('pwd', [], '/');
        expect(response).toEqual('/\n');
    });
});
