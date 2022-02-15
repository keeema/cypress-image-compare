/// <reference path="./index.d.ts" />

import Pixelmatch = require("pixelmatch");

interface IPixelMatchOptions {
    /** Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive. 0.1 by default. */
    threshold?: number;
    /** If true, disables detecting and ignoring anti-aliased pixels. false by default. */
    includeAA?: boolean;
    /* Blending factor of unchanged pixels in the diff output. Ranges from 0 for pure white to 1 for original brightness. 0.1 by default. */
    alpha?: number;
    /* The color of anti-aliased pixels in the diff output. [255, 255, 0] by default. */
    aaColor?: [number, number, number];
    /* The color of differing pixels in the diff output. [255, 0, 0] by default. */
    diffColor?: [number, number, number];
}

interface IResult {
    dimensions: { width: number; height: number };
    found?: string;
    foundPath: string;
    template?: string;
    templatePath: string;
    loadedPath: string;
    diff?: string;
    diffPath: string;
    diffPixels?: number;
    diffPercent?: number;
    match?: boolean;
}

Cypress.Commands.add(
    "pixelMatch",
    (
        subjectImageData: Uint8Array,
        templateImageData: Uint8Array,
        diffData: Uint8Array,
        width: number,
        height: number,
        options?: IPixelMatchOptions
    ): Cypress.Chainable<number> => {
        return cy.wrap(Pixelmatch(templateImageData, subjectImageData, diffData, width, height, options), { log: false });
    }
);

const contentType = "image/png";
Cypress.Commands.add(
    "matchImage",
    {
        prevSubject: "element",
    },
    ($subject: JQuery<HTMLElement>, name: string, options?: Cypress.ICypressImageMatchOptions): Cypress.Chainable<IResult> => {
        const fullName = getFullTestName(name);
        const filledOptions: Cypress.ICypressImageMatchOptionsFilled = Object.assign(
            {
                failureThreshold: 0,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _log: Cypress.log({ message: [fullName] }),
                snapshotFolder: Cypress.config("snapshotFolder") || "snapshots",
                diffFolder: Cypress.config("diffFolder") || "cypress/snapshots-diffs",
            },
            options || {}
        );

        const result: IResult = {
            dimensions: { width: 0, height: 0 },
            templatePath: `${filledOptions.snapshotFolder}/${fullName}.png`,
            diffPath: `${filledOptions.diffFolder}/${fullName}-diff.png`,
            foundPath: `${filledOptions.diffFolder}/${fullName}-found.png`,
            loadedPath: `${filledOptions.diffFolder}/${fullName}-loaded.png`,
        };

        const subjectImg = $subject[0] as HTMLImageElement;

        return cy
            .then(() => (subjectImg.src.indexOf("base64") >= 0 ? cy.wrap(subjectImg.src, { log: false }) : loadFromUrl(subjectImg.src)))
            .then((dataURL) => {
                return cy
                    .then(() => (result.found = dataURL))
                    .then(() => downloadedImageSize(dataURL).then((size) => (result.dimensions = size)))
                    .wrap(dataURL, { log: false });
            })
            .then(() => filledOptions.update && writeDataUrlToFile(result.templatePath, result.found!))
            .readFile(result.templatePath, "binary")
            .then((content) => {
                const blob = Cypress.Blob.binaryStringToBlob(content, contentType);
                return Cypress.Blob.blobToDataURL(blob);
            })
            .then((templateDataURL) => {
                filledOptions.debug && writeDataUrlToFile(result.loadedPath, templateDataURL);
                return templateDataURL;
            })
            .then((templateDataURL) => {
                const templateImageData = getImageData(dataUrlToImage(templateDataURL, result.dimensions));
                const foundImageData = getImageData(dataUrlToImage(result.found!, result.dimensions));
                const diffImageOnCanvas = createEmptyImageOnCanvasOfSize(result.dimensions);
                const diffImageData = diffImageOnCanvas.context.createImageData(result.dimensions.width, result.dimensions.height);

                result.diffPixels = Pixelmatch(
                    templateImageData,
                    foundImageData,
                    diffImageData.data as Object as Uint8Array,
                    result.dimensions.width,
                    result.dimensions.height,
                    filledOptions
                );

                const diffPercent = result.diffPixels / (result.dimensions.width * result.dimensions.height);
                diffImageOnCanvas.context.putImageData(diffImageData, 0, 0);
                result.diff = diffImageOnCanvas.canvas.toDataURL("image/png");
                result.match = diffPercent <= filledOptions.failureThreshold;
                result.diffPercent = Math.round(diffPercent * 10000) / 100;
            })
            .then(() => {
                (filledOptions.debug || !result.match) &&
                    writeDataUrlToFile(result.diffPath, result.diff!) &&
                    writeDataUrlToFile(result.foundPath, result.found!);
                filledOptions._log.set({ $el: $subject, consoleProps: () => result });
            })
            .then(
                () =>
                    expect(
                        result.match,
                        `expect amount of different pixels in ${fullName} to be <= ${filledOptions.failureThreshold * 100}% but it is ${
                            result.diffPercent
                        }%`
                    ).to.be.true
            )
            .wrap(result, { log: false });
    }
);

function getFullTestName(name: string): string {
    try {
        return `${(Cypress as Object as { mocha: { getRunner: Function } }).mocha.getRunner().suite.ctx.test.fullTitle()} - ${name}`;
    } catch {
        return name;
    }
}

function loadFromUrl(url: string): Cypress.Chainable<string> {
    return cy
        .then(() => download(url))
        .then((responseArrayBuffer) => {
            const blob = Cypress.Blob.arrayBufferToBlob(responseArrayBuffer, contentType);
            return Cypress.Blob.blobToDataURL(blob);
        });
}
function downloadedImageSize(base64: string): PromiseLike<{ width: number; height: number }> {
    const image = new Image();

    const promise = new Cypress.Promise<{ width: number; height: number }>((resolve) => {
        image.onload = () => {
            resolve({ width: image.width, height: image.height });
        };
    });

    image.src = base64;
    return promise;
}

function createEmptyImageOnCanvasOfSize(dimensions: { width: number; height: number }): IImageOnCanvas {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d")!;
    return { canvas, context };
}

interface IImageOnCanvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

function download(url: string): PromiseLike<ArrayBuffer> {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    const promise = new Cypress.Promise<ArrayBuffer>((resolve) => {
        oReq.onload = () => {
            resolve(oReq.response);
        };
    });
    oReq.send(null);
    return promise;
}

function writeDataUrlToFile(path: string, dataURL: string): Cypress.Chainable<null> {
    return cy
        .then(() => Cypress.Blob.dataURLToBlob(dataURL))
        .then((blob) => Cypress.Blob.blobToBinaryString(blob))
        .then((blobString) => cy.writeFile(path, blobString, "binary"));
}

function dataUrlToImage(dataUrl: string, dimensions: { width: number; height: number }): HTMLImageElement {
    const image = document.createElement("img");
    image.width = dimensions.width;
    image.height = dimensions.height;
    image.src = dataUrl;
    return image;
}

function getImageData(img: HTMLImageElement): Uint8Array {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        return new Uint8Array();
    }

    ctx.drawImage(img, 0, 0, img.width, img.height);
    return new Uint8Array(ctx.getImageData(0, 0, img.width, img.height).data);
}
