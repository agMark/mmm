import { DocJson } from "./DocJson.mjs";
import { DocSection } from "./DocSection.mjs";

//@ts-check
class ProgramVars{
    constructor(){
        this.DataRootPath = "";
        /**@type {DocJson} */
        this.docJson = null;


        /**@type {DocSection} */
        this.docDef = null;
    }
}

export {ProgramVars}