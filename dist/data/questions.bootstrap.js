"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questions = void 0;
const types_1 = require("../types");
exports.questions = {
    existingOrNew: {
        name: 'existingOrNew',
        message: 'Use existing project or create a new one?',
        type: types_1.QuestionType.Select,
        choices: [
            {
                id: 'new',
                label: 'New project',
            },
            {
                id: 'existing',
                label: 'Existing project',
            },
        ],
    },
    selectProject: (projects) => ({
        name: 'projectId',
        message: 'Select the project',
        type: types_1.QuestionType.Select,
        choices: projects.map((p) => ({
            id: p.projectId,
            label: p.projectId,
        })),
    }),
    newProjectName: {
        name: 'newProjectName',
        message: 'Choose a name for your new project',
    },
};
// const questions = [
//     {
//         name: 'email',
//         message: 'What is your email?',
//         validation: Validation.email,
//     },
//     {
//         name: 'projectType',
//         message: 'Select a type for the project',
//         type: QuestionType.AutoComplete, // or QuestionType.Select
//         limit: 3,
//         choices: [
//             {
//                 id: 'o1',
//                 label: 'one',
//             },
//             {
//                 id: 'o2',
//                 label: 'two',
//             },
//             {
//                 id: 'o3',
//                 label: 'three',
//             },
//         ],
//     },
//     {
//         name: 'projectType',
//         message: 'Select a type for the project',
//         type: QuestionType.MultiSelect,
//         limit: 3,
//         choices: [
//             {
//                 id: 'o1',
//                 label: 'one',
//             },
//             {
//                 id: 'o2',
//                 label: 'two',
//             },
//             {
//                 id: 'o3',
//                 label: 'three',
//             },
//         ],
//     },
// ];
