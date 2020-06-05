// plugins file
import webpackPreprocessor = require("@cypress/webpack-preprocessor");
import cfg = require("../../webpack.config");

function register(on: Cypress.PluginEvents): void {
    const options = {
        webpackOptions: cfg,
        watchOptions: {},
    };
    on("file:preprocessor", getWebpackWithFileChange(options));
}

function getWebpackWithFileChange(options: object): (file: any) => string | Promise<string> {
    const webPackPreProcessor = webpackPreprocessor(options);
    return function (file) {
        file.outputPath = file.outputPath.replace(".ts", ".js");
        return webPackPreProcessor(file);
    };
}

export = register;
