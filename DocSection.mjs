//@ts-check
export class DocSection {
    constructor() {
        this.IsNumbered = false;
        this.SectionNumber = "NO SECTION NUMBER";
        this.DisplayTitle = true;
        this.SectionTitle = "NO SECTION TITLE"
        this.HasContent = false;
        this.ContentFileUrl = "CONTENT FILE NOT SET";
        this.CustomStyle = "";
        this.CustomClass = "";
        this.ElementId = "";
        /**@type {DocSection[]} */
        this.Sections = [];

        /**@type {ChildNode[]} */
        this._html = [];
        this._div = null;
    }


    /**
     * Recursively retrieves the section's and subsection's content.
     */
    GetContent = () => {
        if (this.HasContent) {
            fetch(this.ContentFileUrl)
                .then(response => {
                    if (!response.ok) {
                        console.log("fetch not ok");
                    }
                    return response.text();
                }
                )
                .then(
                    data => {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(data, "text/html");

                        doc.body.childNodes.forEach(c => {
                            this._html.push(c);
                        })
                    }
                )
                .catch(x => console.log("fetch error"));

        }


        this.Sections.forEach(s => {
            s.GetContent();
        });

    }

    /**
     * Renders the html content into an html element.
     * @param {boolean} recursive True to recursively render subjection's content
     * @param {HTMLElement} targetElement 
     */
    RenderContent = (recursive, targetElement) => {
        /**@type {HTMLElement} */
        let d = document.createElement("div");
        this._div = d;
        if (this.ElementId) {
            d.id = this.ElementId;
        }


        if (this.CustomStyle) { d.setAttribute("style", this.CustomStyle); }
        if (this.CustomClass) { d.classList.add(this.CustomClass); }

        if (this.DisplayTitle) {
            let titleString = this.SectionTitle;
            if (this.IsNumbered) {
                titleString = this.SectionNumber + " - " + titleString
                let level = DocSection._countChars(this.SectionNumber, ".");
                level = level + 1;
                let elementType = "h" + level;
                let hHeader = document.createElement(elementType);
                hHeader.innerText = titleString;
                d.appendChild(hHeader);
            }
            else {
                let pHeader = document.createElement("p");
                pHeader.className = "unnumberedHeader";
                pHeader.innerText = titleString;
                d.appendChild(pHeader);
            }
        }

        this._html.forEach(e => {
            d.appendChild(e);
        });


        targetElement.appendChild(d);
        if (recursive) {
            this.Sections.forEach(s => {
                s.RenderContent(true, d);
            });
        }
    }


    /**
     * 
     * @param {boolean} includeSelf Include the first level (first section) in the table of contents.
     * @param {HTMLElement} targetDiv 
     * @param {number} parentLevel Set to 0 if you are ignoring the Section header
     * @param {string} pageNumberPrepend Text that is inserted before the page number...ex "1" in 1-25 for page 25 of section 1.
     */
    CreateToc = (includeSelf, targetDiv, parentLevel = 0, pageNumberPrepend = "") => {
        /*Styling from: https://css-tricks.com/a-perfect-table-of-contents-with-html-css/ */
        let thisLevel = parentLevel + 1;
        if (includeSelf) {
            if (this.DisplayTitle && this.IsNumbered) {
                let d = document.createElement("div");
                d.className = "tocLevel" + thisLevel.toFixed(0);
                let a = document.createElement("a");
                a.className = "tocGrid";
                //TEST
                if (!this.ElementId) {
                    this._div.id = DocSection._generateRandomString(20);
                    a.href = "#" + this._div.id;
                }
                else {
                    a.href = "#" + this._div.id;
                }
                //TEST

                d.appendChild(a);

                let lineText = "";
                if (this.IsNumbered) {
                    lineText += this.SectionNumber + " - " + this.SectionTitle;
                }
                else {
                    lineText += this.SectionTitle;
                }
                let span1 = document.createElement("span");
                span1.innerText = (lineText);
                let spanLeaders = document.createElement("span");
                spanLeaders.className = "tocLeaders";
                spanLeaders.setAttribute("aria-hidden", "true");
                span1.appendChild(spanLeaders);
                a.appendChild(span1);
                let span2 = document.createElement("span");
                span2.className = "tocPageNum";
                span2.innerText = pageNumberPrepend + "XXX";
                a.appendChild(span2);
                targetDiv.appendChild(d);
            }
        }

        this.Sections.forEach(s => {
            s.CreateToc(true, targetDiv, thisLevel, pageNumberPrepend);
        })
    }


    /**
     * Inserts table of contents right after the section header.
     * @param {HTMLElement} tocDiv 
     */
    InsertToc = (tocDiv, breakPageAfterToc = false, createTocHeader = false, tocHeaderText = "", tocHeaderClass = "") => {
        if (createTocHeader) {
            let tDiv = document.createElement("div");
            let pHeader = document.createElement("p");
            pHeader.innerText = tocHeaderText;
            if (tocHeaderClass) {
                pHeader.className = tocHeaderClass;
            }
            tDiv.appendChild(pHeader);
            tDiv.appendChild(tocDiv);
            if (breakPageAfterToc) { tDiv.className = "breakAfter"; }
            this._div.insertBefore(tDiv, this._div.childNodes[1]);
        }
        else {
            if (breakPageAfterToc) { tocDiv.className = "breakAfter"; }
            this._div.insertBefore(tocDiv, this._div.childNodes[1]);
        }
    }

    /**
     * Sets the html id attribute of the section's main div.
     * @param {string} id 
     */
    SetElementId = (id) => {
        this.ElementId = id;
        return this;
    }

    AutoSetElementId = () => {
        if (this.IsNumbered) {
            let id = this.SectionNumber;
            id = id.replaceAll(".", "_");
            id = "Sec_" + id;
            this.SetElementId(id);
        }
        return this;
    }

    /**
     * Simple initialization function that sets the properties for most sections.
     * 
     * @param {boolean} isNumbered 
     * @param {string} sectionNumber 
     * @param {boolean} displayTitle
     * @param {string} sectionTitle 
     * @param {boolean} hasContent 
     * @param {string} contentFileUrl 
     * @param {string} customStyle Custom CSS style applied to the wrapping DIV
     * @returns 
     */
    i = (isNumbered, sectionNumber, displayTitle, sectionTitle, hasContent, contentFileUrl, customStyle = "", inhibitAutoId = false) => {
        this.IsNumbered = isNumbered;
        this.SectionNumber = sectionNumber;
        this.DisplayTitle = displayTitle;
        this.SectionTitle = sectionTitle;
        this.HasContent = hasContent;
        this.ContentFileUrl = contentFileUrl;
        this.CustomStyle = customStyle;
        if (!inhibitAutoId) { this.AutoSetElementId(); }
        return this;
    }

    /**
     * Set the section's subsections.
     * 
     * @param {DocSection[]} sections 
     */
    s = (sections) => {
        this.Sections = sections;
        return this;
    }

    /**
     * @param {string} numberPrepend Text to be added before the figure number ie.  "X" in X-23
     */
    NumberFigures = (numberPrepend) => {

        /**
         * 
         * @param {Object[]} objArr 
         * @param {DocSection} section 
         */
        let recursiveGetFigures = (objArr, section) => {
            section._html.forEach(s => {
                if (s.ELEMENT_NODE === 1) {
                    let e = /**@type {HTMLElement} */(s);
                    if (e.tagName && e.tagName.toLocaleLowerCase && e.tagName.toLocaleLowerCase() === "figure") {
                        let imgs = e.getElementsByTagName("img");
                        let figCaptions = e.getElementsByTagName("figcaption");
                        if (!imgs || imgs.length === 0) {
                            console.log("figure tag doesn't have img");
                        }
                        else if (imgs.length > 1) {
                            console.log("figure tag has multiple images");
                        }
                        else {
                            let o = {
                                figureElement: e,
                                imgSrc: imgs[0].src
                            };

                            figCaptions && figCaptions.length === 1 ? o.figCaption = figCaptions[0] : o.figCaption = null;
                            objArr.push(o);
                        }
                    }
                    if (e.getElementsByTagName) {
                        let figs = e.getElementsByTagName("figure");
                        if (figs && figs.length > 0) {
                            for (let i = 0; i < figs.length; i++) {
                                let imgs = figs[i].getElementsByTagName("img");
                                let figCaptions = figs[i].getElementsByTagName("figcaption");
                                if (!imgs || imgs.length === 0) {
                                    console.log("figure tag doesn't have img");
                                }
                                else if (imgs.length > 1) {
                                    console.log("figure tag has multiple images");
                                }
                                else {
                                    let o = {
                                        figureElement: figs[i],
                                        imgSrc: imgs[0].src
                                    };

                                    figCaptions && figCaptions.length === 1 ? o.figCaption = figCaptions[0] : o.figCaption = null;
                                    objArr.push(o);
                                }
                            }
                        }
                    }

                }
            });

            section.Sections.forEach(s => {
                recursiveGetFigures(objArr, s)
            });
        };

        let figs = [];
        recursiveGetFigures(figs, this);

        let figNum = 1;
        for (let i = 0; i < figs.length; i++) {
            figs[i].figNum = figNum;
            figs[i].figCaption.innerText = numberPrepend + figNum.toFixed(0) + " " + figs[i].figCaption.innerText;
            figNum++;
        }

        let xxx = 2;
    }

    /**
     * 
     * @param {DocSection} topLevelSection 
     */
    ResolveXrefs = (topLevelSection) => {

        /**
         * 
         * @param {Object[]} objArr 
         * @param {DocSection} section 
         */
        let recursiveGetSectionsAndTargets = (objArr, section) => {
            if (section.IsNumbered) {
                objArr.push({
                    docSection: section,
                    fileName: section.ContentFileUrl,
                    sectionNumber: section.SectionNumber
                });
            }
            section.Sections.forEach(s => {
                recursiveGetSectionsAndTargets(objArr, s);
            })
        }
        let xRefTargets = [];
        recursiveGetSectionsAndTargets(xRefTargets, topLevelSection);

        //quality check to make sure there aren't duplicate file names
        let allFileNames = [];
        for (let i = 0; i < xRefTargets.length; i++) {
            if (xRefTargets[i].fileName && xRefTargets[i].fileName !== undefined) {
                if (allFileNames.indexOf(xRefTargets[i].fileName) >= 0) {
                    console.log("Warning: Duplicate filename found in xref routine....  " + xRefTargets[i].fileName);
                }
                else {
                    allFileNames.push(xRefTargets[i].fileName);
                }
            }
        }


        let _RecursiveResolveXrefs = (section) => {
            section._html.forEach(s => {
                if (s.ELEMENT_NODE === 1) {
                    //is an element node
                    let e = /**@type {HTMLElement} */(s);
                    if (e.getElementsByTagName) {
                        let xrefs = e.getElementsByTagName("xref");
                        if (xrefs && xrefs.length > 0) {
                            while (xrefs.length > 0) {
                                let fileTarget = xrefs[0].getAttribute("fileTarget");
                                let xrefType = xrefs[0].getAttribute("xrefType");
                                let prependLabel = xrefs[0].getAttribute("prependLabel");
                                let sectionTarget = xrefs[0].getAttribute("sectionTarget");

                                /**@type {DocSection} */
                                let targetSection = null;
                                if (sectionTarget) {
                                    for (let j = 0; j < xRefTargets.length; j++) {
                                        if (xRefTargets[j].sectionNumber === sectionTarget) {
                                            targetSection = xRefTargets[j].docSection;
                                            break;
                                        }
                                    }
                                    if (!targetSection) {
                                        console.log("Invalid xref target section: " + sectionTarget);
                                    }
                                }
                                else if (fileTarget) {
                                    for (let j = 0; j < xRefTargets.length; j++) {
                                        if (xRefTargets[j].fileName === fileTarget) {
                                            targetSection = xRefTargets[j].docSection;
                                            break;
                                        }
                                    }
                                    if (!targetSection) {
                                        console.log("Invalid xref target file: " + fileTarget);
                                    }
                                }
                                else {
                                    console.log("invalid xref target");
                                }


                                if (targetSection) {
                                    if (!xrefType || xrefType === "link") {
                                        let a = document.createElement("a");
                                        a.href = "#" + targetSection.ElementId;
                                        prependLabel ? a.innerText = prependLabel + " " + targetSection.SectionNumber : a.innerText = targetSection.SectionNumber;
                                        xrefs[0].replaceWith(a);
                                    }
                                }
                                else {
                                    throw "Xref Issue, Stopping Code";
                                }

                            }

                        };
                    }

                }
            });

            section.Sections.forEach(s => {
                _RecursiveResolveXrefs(s);
            });
        }

        _RecursiveResolveXrefs(topLevelSection);


    }


    /**
     * Recursively initializes all sections when a
     * data was sourced from a dumb json file.
     * Used when loading the sections from a json file instead of through
     * the original javascript method.
     * @param {DocSection} section Not necessarily a true DocSection. Intended to be used on an Object with a Sections[] parameter.
     */
    static InitFromJson = (section) => {
        let d = new DocSection();
        section.GetContent = d.GetContent;
        section.RenderContent = d.RenderContent;
        section.CreateToc = d.CreateToc;
        section.SetElementId = d.SetElementId;
        section.AutoSetElementId = d.AutoSetElementId;
        section.i = d.i;
        section.s = d.s;
        section.NumberFigures = d.NumberFigures;
        section.ResolveXrefs = d.ResolveXrefs;
        section.Sections.forEach(element => {
            DocSection.InitFromJson(element);
        });
    }


    /**
     * Function used internally.
     * Counts the number of characters (char) in a string (str)
     * 
     * @param {string} str 
     * @param {string} char 
     * @returns 
     */
    static _countChars(str, char) {
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === char) {
                count++;
            }
        }
        return count;
    }

    /**
     * Generates a random string from standard letters and numbers.
     * @param {number} length Length of the string to be generated.
     * @returns 
     */
    static _generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        let result = "";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }



}


