//@ts-check
import { DocSection } from "./DocSection.mjs";
import { ProgramVars } from "./ProgramVars.mjs";
// @ts-ignore
var programVars = new ProgramVars(); //client version of program vars
import { myFetch } from "./fetchWrapper.mjs";
import { GetFile, GetFileResponse } from "./GetFile.mjs";






class CheckBoxWithLabel {
    /**
     * 
     * @param {string} label 
     */
    constructor(label) {
        this._d = document.createElement("div");
        // this._d.style.display = "inline-block";

        this._i = document.createElement("input");
        this._i.type = "checkbox";
        this._d.appendChild(this._i);

        let p = document.createElement("label");
        p.innerText = label;
        this._d.appendChild(p)
    }
    RenderHtml = () => {
        return this._d;
    }

    /**
     * 
     * @param {boolean} checkState 
     */
    SetCheckState = (checkState) => {
        if (checkState) {
            this._i.checked = true;
        }
        else {
            this._i.checked = false;
        }
    }
}

class TextBoxWithLabel {
    /**
     * 
     * @param {string} label 
     */
    constructor(label) {
        this._d = document.createElement("div");
        // this._d.style.display = "inline-block";



        let p = document.createElement("label");
        p.innerText = label;
        this._d.appendChild(p)

        this._i = document.createElement("input");
        this._i.type = "text";
        this._d.appendChild(this._i);
    }
    RenderHtml = () => {
        return this._d;
    }

    SetText = (text) => {
        this._i.value = text;
    }
}

// @ts-ignore
class AttributeViewer {
    constructor() {
        this.containerDiv = document.getElementById("attributes");
        /*
                this.IsNumbered = false;
                this.SectionNumber = "NO SECTION NUMBER";
                this.DisplayTitle = true;
                this.SectionTitle = "NO SECTION TITLE"
                this.HasContent = false;
                this.ContentFileUrl = "CONTENT FILE NOT SET";
                this.CustomStyle = "";
                this.CustomClass = "";
        */

        this.cBox_IsNumbered = new CheckBoxWithLabel("Is Numbered");
        // @ts-ignore
        this.containerDiv.appendChild(this.cBox_IsNumbered.RenderHtml());

        this.tBox_SectionNumber = new TextBoxWithLabel("Section Number");
        // @ts-ignore
        this.containerDiv.appendChild(this.tBox_SectionNumber.RenderHtml());

        this.cBox_DisplayTitle = new CheckBoxWithLabel("Display Title");
        // @ts-ignore
        this.containerDiv.appendChild(this.cBox_DisplayTitle.RenderHtml());

        this.tBox_SectionTitle = new TextBoxWithLabel("Section Title");
        // @ts-ignore
        this.containerDiv.appendChild(this.tBox_SectionTitle.RenderHtml());

        this.cBox_HasContent = new CheckBoxWithLabel("Has Html Content");
        // @ts-ignore
        this.containerDiv.appendChild(this.cBox_HasContent.RenderHtml());

        this.tBox_ContentUrl = new TextBoxWithLabel("Content Html Url");
        // @ts-ignore
        this.containerDiv.appendChild(this.tBox_ContentUrl.RenderHtml());

        this.tBox_CustomStyle = new TextBoxWithLabel("Custom Style Attribute");
        // @ts-ignore
        this.containerDiv.appendChild(this.tBox_CustomStyle.RenderHtml());

        this.tBox_CustomClass = new TextBoxWithLabel("Custom Class Attribute");
        // @ts-ignore
        this.containerDiv.appendChild(this.tBox_CustomClass.RenderHtml());
    }
    SetMode = () => {

    }

    /**
     * 
     * @param {DocSection} section 
     */
    Update = (section) => {
        this.ClearAll();
        this.cBox_IsNumbered.SetCheckState(section.IsNumbered);
        this.tBox_SectionNumber.SetText(section.SectionNumber);
        this.cBox_DisplayTitle.SetCheckState(section.DisplayTitle);
        this.tBox_SectionTitle.SetText(section.SectionTitle);
        this.cBox_HasContent.SetCheckState(section.HasContent);
        this.tBox_ContentUrl.SetText(section.ContentFileUrl);
        this.tBox_CustomStyle.SetText(section.CustomClass);
    }
    ClearAll = () => {
        this.cBox_IsNumbered.SetCheckState(false);
        this.tBox_SectionNumber.SetText("");
        this.cBox_DisplayTitle.SetCheckState(false);
        this.tBox_SectionTitle.SetText("");
        this.cBox_HasContent.SetCheckState(false);
        this.tBox_ContentUrl.SetText("");
        this.tBox_CustomStyle.SetText("");
    }
}

// @ts-ignore
class PreviewFrame {
    constructor() {
        /**@type {HTMLIFrameElement} */
        this.iframe = /**@type {HTMLIFrameElement}*/ (document.getElementById("iframePreview"));
        this.iframe.onload = () => {
            this.ResolveImages();
            this.ResolveXrefs();
        }

        this.css = ""; //Needs to be set with "SetCss()"


        //@ts-ignore
        document.getElementById("menuBtn_Edit").onclick = () => {
            //@ts-ignore
            this.iframe.contentWindow.document.body.contentEditable = "true";
            //@ts-ignore
            this.iframe.contentWindow.document.body.spellcheck = "true";
            //@ts-ignore
            document.getElementById("menuBtn_Edit").style.backgroundColor = "lightsalmon";
        };

    }

    /**
     * 
     * @param {DocSection} section 
     */
    Update = (section) => {
        let noContent = "<html><p style='background-color:aqua; font-weight:bold;'>This Section Does Not Have Its Own Html Content</p></html>";
        if (section.HasContent) {
            //Fetch the content
            //need to correct the url because the page isn't in the same folder as the content
            //this should get smarter.
            let url = "../" + section.ContentFileUrl;
            let html = "<html><head><style>STYLEHERE</style></head><body>BODYHERE</body></html>";

            if (this.css) {
                html = html.replace("STYLEHERE", this.css);
            }

            /**
             * 
             * @param {GetFileResponse} resp 
             */
            let getContentSuccess = (resp) => {
                if (resp && resp.success) {
                    html = html.replace("BODYHERE", resp.data);
                    this.iframe.srcdoc = html;
                }
                else {
                    this.iframe.srcdoc = noContent;
                }
            }
            let getContentFailure = () => {
                console.log('oops');
            }

            let gf = new GetFile();
            gf.FileType = "html";
            gf.FileUrl = section.ContentFileUrl;

            myFetch("/getFile/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gf)
            }, getContentSuccess, getContentFailure);
        }
        else {
            this.iframe.srcdoc = noContent;
        }
    }

    ResolveImages = () => {
        let images = Array.from(this.iframe.contentWindow.document.getElementsByTagName("img"));
        images.forEach(img => {
            let gf = new GetFile();
            gf.FileType = "imgBase64";
            gf.FileUrl = img.getAttribute("src");

            /**
             * 
             * @param {GetFileResponse} data 
             */
            let getImageSuccess = (data) => {
                if (data && data.success) {

                    img.src = "data:image/jpeg;charset=utf-8;base64," + data.data;
                }
            };
            let getImageFailure = () => {
                console.log("Couldn't fetch image.");
            }
            myFetch("/getFile/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gf)
            }, getImageSuccess, getImageFailure);
        });
    }

    ResolveXrefs = () => {
        let xrefs = Array.from(this.iframe.contentWindow.document.getElementsByTagName("xref"));
        xrefs.forEach(x => {
            x.innerHTML = "XREF";
            x.st
        })
        let brkhere = 1;
    }


    /**
     * 
     * @param {string[]} cssFileUrls 
     */
    SetCss = (cssFileUrls) => {

        for (let i = 0; i < cssFileUrls.length; i++) {

            /**
             * 
             * @param {GetFileResponse} data 
             */
            let getContentSuccess = (data) => {
                if (data && data.success) {
                    this.css += data.data;
                }
            };
            let getContentFailure = () => {
                console.log("CSS Fetch Failed.");
            }
            let gf = new GetFile();
            gf.FileType = "css";
            gf.FileUrl = cssFileUrls[i];

            myFetch("/getFile/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gf)
            }, getContentSuccess, getContentFailure);
        }
    }
}

// @ts-ignore
class TreeItem {
    constructor() {
        this.li = document.createElement("li");
        this.li.style.cursor = "pointer";
        this.li.onclick = (e) => {
            e.stopPropagation();
            this.LiClicked(e);
        };
        this._section = null;

        this._clickHandlers = [];
    }

    /**
     * 
     * @param {DocSection} section 
     */
    Init = (section) => {
        this._section = section;
        let liText = "";
        if (section.IsNumbered) {
            liText = "Section " + section.SectionNumber;
        }
        else {
            liText = "Un-Numbered Section";
        }
        if (section.DisplayTitle) {
            liText += " - " + section.SectionTitle
        }
        this.li.innerText = liText;

    }

    GetHtmlItem = () => {
        return this.li;
    }

    /**
     * 
     * @param {(arg0: DocSection, arg1: TreeItem) => void} handler 
     */
    AddClickHandler = (handler) => {
        this._clickHandlers.push(handler);
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    // @ts-ignore
    LiClicked = (e) => {
        if (this._clickHandlers) {
            this._clickHandlers.forEach(h => {
                h(this._section, this);
            })
        }
    }
}




let attrSection = new AttributeViewer();
let previewFrame = new PreviewFrame();

/**@type {TreeItem[]} */
let allTreeItems = [];

/**
 * 
 * @param {DocSection} section 
 * @param {TreeItem} clickedItem 
 */
let styleClickedTreeItem = (section, clickedItem) => {
    allTreeItems.forEach(ti => {
        ti.li.style.backgroundColor = "white";
    })
    clickedItem.li.style.backgroundColor = "lightblue";
}

/**
 * 
 * @param {DocSection} section 
 * @param {HTMLUListElement} parentUl 
 */
let recursiveThroughSections = (section, parentUl) => {
    let ti = new TreeItem();
    ti.Init(section);
    ti.AddClickHandler(attrSection.Update);
    ti.AddClickHandler(previewFrame.Update);
    ti.AddClickHandler(styleClickedTreeItem);
    allTreeItems.push(ti);
    parentUl.appendChild(ti.GetHtmlItem());

    if (section.Sections && section.Sections.length > 0) {
        let ul = document.createElement("ul");
        ti.GetHtmlItem().appendChild(ul);
        section.Sections.forEach(s => {
            recursiveThroughSections(s, ul);
        });
    }

}















/////////////////////////////////////////////////////////////////////////
// @ts-ignore
window.onload = (event) => {
    // @ts-ignore
    document.getElementById("chooseFile").style.visibility = "visible";

    //@ts-ignore
    // @ts-ignore
    document.getElementById("btnChooseFile").onclick = (e) => {
        /**
         * 
         * @param {ProgramVars} data 
         */
        let getSuccess = (data) => {
            programVars = data;
            // @ts-ignore
            document.getElementById("chooseFile").style.visibility = "hidden";

            DocSection.InitFromJson(programVars.docDef);
            recursiveThroughSections(programVars.docDef, document.getElementById("tree"));

            data.docDef.Sections[1].NumberFigures("Figure 1-");
            data.docDef.Sections[2].NumberFigures("Figure 2-");
            data.docDef.Sections[3].NumberFigures("Figure 3-");
            data.docDef.Sections[4].NumberFigures("Figure 4-");
            data.docDef.Sections[5].NumberFigures("Figure 5-");
            data.docDef.Sections[6].NumberFigures("Figure 6-");
            previewFrame.SetCss(data.docJson.CssFiles);
            //@ts-ignore
            document.getElementById("editor").style.visibility = "visible";
        };
        let getFailure = (err) => {
            throw err;
        }
        myFetch("/loadDocDef/", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        }, getSuccess, getFailure);
    };
};