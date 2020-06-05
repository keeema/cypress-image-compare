export = {
    resolve: {
        extensions: [".js", ".ts", ".d.ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/plugin/],
                use: [
                    {
                        loader: "ts-loader",
                        options: { allowTsInNodeModules: true },
                    },
                ],
            },
        ],
    },
    mode: "development",
};
