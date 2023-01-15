module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.jsx$': 'babel-jest',
        '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {},
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
};
