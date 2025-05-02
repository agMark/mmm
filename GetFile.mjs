class GetFile {
    constructor() {
        this.FileUrl = "";
        this.FileType = "";
    }
}

class GetFileResponse{
    constructor(){
        this.message = "";
        this.success = false;
        this.data = "";
    }
}

export {GetFile,GetFileResponse}