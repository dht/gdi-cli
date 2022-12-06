"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionsSemantic = void 0;
const input_1 = require("../input");
const questionsSemantic = (scopes) => [
    {
        name: 'type',
        message: 'type',
        type: input_1.QuestionType.AutoComplete,
        selectedId: 'infra',
        choices: [
            {
                id: 'infra',
                label: 'infra',
            },
            {
                id: 'feat',
                label: 'feat',
            },
            {
                id: 'fix',
                label: 'fix',
            },
        ],
    },
    {
        name: 'scope',
        message: 'scope',
        type: 'AutoComplete',
        selectedId: scopes[0],
        choices: scopes.map((scope) => ({
            id: scope,
            label: scope,
        })),
        limit: 10,
    },
    {
        name: 'summary',
        message: 'short summary',
        type: input_1.QuestionType.Input,
    },
];
exports.questionsSemantic = questionsSemantic;
