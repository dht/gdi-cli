"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: img-size
// desc: calculate image sizes
const fs_1 = __importDefault(require("fs"));
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const argv_1 = require("../../utils/argv");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
let cwdRoot = cwd;
while (fs_1.default.existsSync(cwdRoot + '/package.json') === false) {
    cwdRoot = path_1.default.resolve(cwdRoot + '/../');
}
const publicRoot = path_1.default.resolve(cwdRoot + '/public');
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = globby_1.default.sync('*.data.ts', { cwd });
    for (let file of files) {
        const data = readDataFile(`${cwd}/${file}`);
        const dataWithImageSizes = [];
        for (let item of data) {
            const { imageUrl } = item;
            const imagePath = path_1.default.resolve(publicRoot + imageUrl);
            const image = yield (0, sharp_1.default)(imagePath);
            const metadata = yield image.metadata();
            const { width = 0, height = 1 } = metadata;
            dataWithImageSizes.push(Object.assign(Object.assign({}, item), { imageWidth: width, imageHeight: height, ratio: width / height }));
        }
        fs_1.default.writeFileSync(`${cwd}/${file}`, `export const items = ${JSON.stringify(dataWithImageSizes, null, 4)}`);
    }
});
const readDataFile = (filepath) => {
    const raw = fs_1.default.readFileSync(filepath, 'utf-8');
    const code = raw.replace(/export const [a-zA-Z]+ =/, '');
    return new Function(`return ${code}`)();
};
run();
