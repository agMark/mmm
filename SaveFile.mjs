class SaveFile {
    constructor() {
        this.FileUrl = "";
        this.FileContents = "";
    }
}

class SaveFileResponse{
    constructor(){
        this.message = "";
        this.success = false;
        this.data = "";
    }
}

export {SaveFile,SaveFileResponse}