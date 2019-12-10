import * as b from "bobril";
import { sample2 } from "./sample2";

b.init(() => (
    <>
        <img id="sample" src={b.asset("./sample.png")} />
        <img id="sample2" src={sample2} />
    </>
));
