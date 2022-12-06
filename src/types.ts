import { Command } from './utils/command';

export type Json = Record<string, any>;

export type Middleware = (command: Command, next: any) => void | Promise<void>;

export type File = {
    filepath: string;
    content: string;
};

export type CreateMiddlewares = {
    preRun: () => Middleware;
    parseInstructions: () => Middleware;
    postRun: () => Middleware;
};

export type LocalParams = {
    entityType: string;
    entityName: string;
    cwd: string;
    outputDir: string;
    templatesPath: string;
    templatePath: string;
    template: string;
};

export type ReplaceMethod = (local: LocalParams) => string;
export type ReplaceMap = Record<string, ReplaceMethod>;

export type Local = {
    params: LocalParams;
    rulesReplaceFileName: ReplaceMap;
    rulesReplaceContent: ReplaceMap;
    filesToCreate: File[];
} & Json;

export enum QuestionType {
    'AutoComplete' = 'AutoComplete',
    'BasicAuth' = 'BasicAuth',
    'Confirm' = 'Confirm',
    'Editable' = 'Editable',
    'Form' = 'Form',
    'Input' = 'Input',
    'Invisible' = 'Invisible',
    'List' = 'List',
    'MultiSelect' = 'MultiSelect',
    'Numeral' = 'Numeral',
    'Password' = 'Password',
    'Scale' = 'Scale',
    'Select' = 'Select',
    'Snippet' = 'Snippet',
    'Sort' = 'Sort',
    'Survey' = 'Survey',
    'Text' = 'Text',
    'Toggle' = 'Toggle',
    'Quiz' = 'Quiz',
}

export enum Validation {
    'email' = 'email',
    'url' = 'url',
}

export type InitialMethod = (instance: any) => string;

export type Question = {
    name: string;
    message?: string;
    type?: QuestionType;

    limit?: number;
    selectedId?: string;
    choices?: Choice[];
    optional?: boolean;
    showIds?: boolean;
    initial?: string | InitialMethod;
    validation?: Validation;
};

export type Choice = {
    id: string;
    label: string;
};
