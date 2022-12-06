import { QuestionType } from '../types';

export const questions = {
    existingOrNew: {
        name: 'existingOrNew',
        message: 'Use existing project or create a new one?',
        type: QuestionType.Select,
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
    selectProject: (projects: Json[]) => ({
        name: 'projectId',
        message: 'Select the project',
        type: QuestionType.Select,
        choices: projects.map((p) => ({
            id: p.projectId,
            label: p.projectId,
        })),
    }),
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
