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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core = __importStar(require("@actions/core"));
const actionsUtil = __importStar(require("./actions-util"));
const config_utils_1 = require("./config-utils");
const logging_1 = require("./logging");
async function run(uploadSarifDebugArtifact) {
    const logger = (0, logging_1.getActionsLogger)();
    const config = await (0, config_utils_1.getConfig)(actionsUtil.getTemporaryDirectory(), logger);
    if (config === undefined) {
        throw new Error("Config file could not be found at expected location. Did the 'init' action fail to start?");
    }
    // Upload Actions SARIF artifacts for debugging
    if (config?.debugMode) {
        core.info("Debug mode is on. Uploading available SARIF files as Actions debugging artifact...");
        const outputDir = actionsUtil.getRequiredInput("output");
        await uploadSarifDebugArtifact(config, outputDir);
    }
}
//# sourceMappingURL=analyze-action-post-helper.js.map