//@ts-check

class DocJson{
    constructor(){
       this.DocumentNumber = "";
       this.LatestDate = "";
       this.DocDefFile = "";
       this.RenderFile = "";
       this.HtmlFile = "";
       /**@type {string[]} */
       this.CssFiles = [];
    }
}

export { DocJson }
