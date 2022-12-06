// see: https://stackoverflow.com/questions/67579700/typescript-how-to-import-autocomplete-from-enquirer
// @ts-ignore-next-line
import { AutoComplete, BooleanPrompt, prompt } from 'enquirer';
import * as yup from 'yup';
import { Choice, Question, QuestionType } from '../types';

const DEFAULT_FIELD_NAME = 'field';

export type Questions = Question[];

export const autoComplete = async (message: string, choices: string[]) => {
    const prompt = new AutoComplete({
        name: DEFAULT_FIELD_NAME,
        message,
        limit: 10,
        choices,
    });

    try {
        return prompt.run();
    } catch (err) {
        return null;
    }
};

export const boolean = async (message: string) => {
    const prompt = new BooleanPrompt({
        message,
    });

    try {
        return prompt.run();
    } catch (err) {
        return null;
    }
};

const parseChoices = (
    choices: Choice[] = [],
    selectedId?: string,
    showIds?: boolean
) => {
    return choices.map((choice) => {
        let message = choice.label;

        if (showIds) {
            message = `${choice.label} | ${choice.id}`;
        }

        return {
            value: choice.id,
            name: choice.label,
            message,
            hint: selectedId === choice.id ? '<==========' : '',
        };
    });
};

const findInitial = (question: Question) => {
    const { choices = [] } = question;
    return choices.findIndex((choice) => choice.id === question.selectedId);
};

const validators = {
    email: yup.string().email().required(),
    url: yup.string().url().required(),
};

const validationErrors = {
    email: 'A valid email is required',
    url: 'A valid URL is required',
};

const validate = (question: Question) => async (value: any) => {
    const { validation } = question;

    if (validation && validators[validation]) {
        const isValid = await validators[validation].isValid(value);

        if (!isValid) {
            return validationErrors[validation];
        }
    }

    return true;
};

export const askQuestion = async (question: Question) => {
    const answers = (await askQuestions([question])) as Json;
    return answers[question.name];
};

export const parseAnswers = (answers: Json, questions: Questions) => {
    questions.forEach((question) => {
        const { name } = question;

        switch (question.type) {
            case QuestionType.AutoComplete:
            case QuestionType.Select:
            case QuestionType.MultiSelect:
                const { choices = [] } = question;
                const selectedChoice = choices.find(
                    (choice) => choice.label === answers[name]
                );
                answers[name] = selectedChoice?.id;
                break;
            case QuestionType.Input:
            default:
                break;
        }
    });

    return answers;
};

export const askQuestions = async (questions: Questions) => {
    const parsedQuestions = questions.map((question) => {
        const { name, message, type = 'Input', optional, initial } = question;

        const output: any = {
            name,
            type,
            message: message ?? name + ':',
            required: !optional,
            validate: validate(question),
        };

        switch (question.type) {
            case QuestionType.AutoComplete:
            case QuestionType.Select:
            case QuestionType.MultiSelect:
                const { choices, selectedId, limit, showIds } = question;
                output.limit = limit;
                output.choices = parseChoices(choices, selectedId, showIds);
                output.initial = findInitial(question);
                break;
            case QuestionType.Input:
            default:
                output.initial = initial;
                break;
        }

        return output;
    });

    const answers = await prompt(parsedQuestions);

    return parseAnswers(answers, questions);
};
