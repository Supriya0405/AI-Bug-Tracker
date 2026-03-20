"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const env_1 = require("./config/env");
const port = env_1.env.port;
index_1.default.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map