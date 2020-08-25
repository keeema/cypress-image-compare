// plugins file
import webpackPreprocessor = require("@cypress/webpack-preprocessor");
import cfg = require("../../webpack.config");

function register(on: Cypress.PluginEvents): void {
    const options = {
        webpackOptions: cfg,
        watchOptions: {},
    };
    on("file:preprocessor", webpackPreprocessor(options as any) as (file: unknown) => string | Promise<string>);
}

export = register;
