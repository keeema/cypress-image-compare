/// <reference types="cypress" />

declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface ResolvedConfigOptions {
        snapshotFolder: string;
        diffFolder: string;
    }
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

    interface ICypressImageMatchOptions extends IPixelMatchOptions {
        update?: boolean;
        debug?: true;
        failureThreshold?: number;
        snapshotFolder?: string;
        diffFolder?: string;
    }

    interface ICypressImageMatchOptionsFilled extends ICypressImageMatchOptions {
        failureThreshold: number;
        _log: Cypress.Log;
        snapshotFolder: string;
        diffFolder: string;
    }

    interface Chainable<Subject> {
        matchImage(name: string, options?: ICypressImageMatchOptions): Chainable<IResult>;

        pixelMatch(
            subjectImageData: Uint8Array,
            templateImageData: Uint8Array,
            diffData: Uint8Array,
            width: number,
            height: number,
            options?: IPixelMatchOptions
        ): Chainable<number>;
    }
}
