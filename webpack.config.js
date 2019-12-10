module.exports = {
    resolve: {
        extensions: [".js", ".ts", ".d.ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: { allowTsInNodeModules: true }
                    }
                ]
            }
        ]
    },
    mode: "development"
};
