"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestions = exports.parseAnswers = exports.askQuestion = exports.boolean = exports.autoComplete = void 0;
// see: https://stackoverflow.com/questions/67579700/typescript-how-to-import-autocomplete-from-enquirer
// @ts-ignore-next-line
const enquirer_1 = require("enquirer");
const yup = __importStar(require("yup"));
const types_1 = require("../types");
const DEFAULT_FIELD_NAME = 'field';
const autoComplete = (message, choices) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = new enquirer_1.AutoComplete({
        name: DEFAULT_FIELD_NAME,
        message,
        limit: 10,
        choices,
    });
    try {
        return prompt.run();
    }
    catch (err) {
        return null;
    }
});
exports.autoComplete = autoComplete;
const boolean = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = new enquirer_1.BooleanPrompt({
        message,
    });
    try {
        return prompt.run();
    }
    catch (err) {
        return null;
    }
});
exports.boolean = boolean;
const parseChoices = (choices = [], selectedId, showIds) => {
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
const findInitial = (question) => {
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
const validate = (question) => (value) => __awaiter(void 0, void 0, void 0, function* () {
    const { validation } = question;
    if (validation && validators[validation]) {
        const isValid = yield validators[validation].isValid(value);
        if (!isValid) {
            return validationErrors[validation];
        }
    }
    return true;
});
const askQuestion = (question) => __awaiter(void 0, void 0, void 0, function* () {
    const answers = (yield (0, exports.askQuestions)([question]));
    return answers[question.name];
});
exports.askQuestion = askQuestion;
const parseAnswers = (answers, questions) => {
    questions.forEach((question) => {
        const { name } = question;
        switch (question.type) {
            case types_1.QuestionType.AutoComplete:
            case types_1.QuestionType.Select:
            case types_1.QuestionType.MultiSelect:
                const { choices = [] } = question;
                const selectedChoice = choices.find((choice) => choice.label === answers[name]);
                answers[name] = selectedChoice === null || selectedChoice === void 0 ? void 0 : selectedChoice.id;
                break;
            case types_1.QuestionType.Input:
            default:
                break;
        }
    });
    return answers;
};
exports.parseAnswers = parseAnswers;
const askQuestions = (questions) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedQuestions = questions.map((question) => {
        const { name, message, type = 'Input', optional, initial } = question;
        const output = {
            name,
            type,
            message: message !== null && message !== void 0 ? message : name + ':',
            required: !optional,
            validate: validate(question),
        };
        switch (question.type) {
            case types_1.QuestionType.AutoComplete:
            case types_1.QuestionType.Select:
            case types_1.QuestionType.MultiSelect:
                const { choices, selectedId, limit, showIds } = question;
                output.limit = limit;
                output.choices = parseChoices(choices, selectedId, showIds);
                output.initial = findInitial(question);
                break;
            case types_1.QuestionType.Input:
            default:
                output.initial = initial;
                break;
        }
        return output;
    });
    const answers = yield (0, enquirer_1.prompt)(parsedQuestions);
    return (0, exports.parseAnswers)(answers, questions);
});
exports.askQuestions = askQuestions;
