//const express = require('express');
import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
import bodyParser from 'body-parser';
const app = express();
const port = 3000;


import fs from 'fs';
import { DocJson } from "./DocJson.mjs";
import { ProgramVars } from './ProgramVars.mjs';
var programVars = new ProgramVars();

import dialog from 'dialog-node'; //had to overwrite the vbs script that came with the library... see "dialog-node vbs overwrite.txt"
import { DocSection } from './DocSection.mjs';
import { GetFile, GetFileResponse } from './GetFile.mjs';
import { SaveFile, SaveFileResponse } from './SaveFile.mjs';
import { simpleGit } from 'simple-git';
import { GetDiffs, GetDiffsResponse } from './GetDiffs.mjs';
import { CommitDiffs, CommitDiffsResponse } from './CommitDiffs.mjs';

var git = null;//simpleGit();

app.use(express.static(__dirname));
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ChooseFile.html'));
});

app.get('/loadDocDef/', (req, res) => {
  /**
   * 
   * @param {any} code 
   * @param {string} retVal 
   * @param {any} stderr 
   */
  let callback = function (code, retVal, stderr) {
    let fPath = retVal.substring(0, retVal.lastIndexOf(".") + 5);//file dialog keeps returning extra characters (line returns)
    console.log("return value = <" + fPath + ">");


    programVars.DataRootPath = path.dirname(fPath);

    /**@type {DocJson} */
    let fileContents = JSON.parse(fs.readFileSync(fPath).toString());
    programVars.docJson = fileContents;


    let docDefPath = path.join(programVars.DataRootPath, programVars.docJson.DocDefFile);
    let docDefContents = fs.readFileSync(docDefPath).toString();
    programVars.docDef = JSON.parse(docDefContents);


    openGitRemote();


    res.send(programVars);
  }

  dialog.fileselect("msg", "title", 0, callback);

});




app.post('/getFile/', (req, res) => {
  /**@type {GetFile} */
  let reqData = req.body;
  let reqRes = new GetFileResponse();

  if (reqData.FileType === "html" || reqData.FileType === "css" || reqData.FileType === "js") {
    let fPath = path.join(programVars.DataRootPath, reqData.FileUrl);
    try {
      let fileContents = fs.readFileSync(fPath).toString();
      reqRes.success = true;
      reqRes.data = fileContents;
    }
    catch {
      reqRes.message = "Read File Error";
    }
  }
  else if (reqData.FileType === "imgBase64") {
    let fPath = path.join(programVars.DataRootPath, reqData.FileUrl);
    try {
      let fileContents = fs.readFileSync(fPath).toString('base64');
      reqRes.success = true;
      reqRes.data = fileContents;
    }
    catch {
      reqRes.message = "Read File Error";
    }
  }



  res.send(reqRes);
});

app.post('/saveFile/', (req, res) => {
  /**@type {SaveFile} */
  let reqData = req.body;
  let reqRes = new SaveFileResponse();

  let filePath = path.join(programVars.DataRootPath, reqData.FileUrl);

  try {
    fs.writeFileSync(filePath, reqData.FileContents, { encoding: "utf-8" });
    reqRes.success = true;
  }
  catch {
    reqRes.success = false;
  }


  res.send(reqRes);
});


app.post('/getDiffs/', (req, res) => {
  /**@type {GetDiffs} */
  let reqData = req.body;
  let reqRes = new GetDiffsResponse();


  let gitDiffDone = (d) => {
    reqRes.success = true;
    reqRes.diffs = d;
    res.send(reqRes);
  };
  GitDiff(gitDiffDone)


});

app.post('/commitDiffs/', (req, res) => {
  /**@type {CommitDiffs} */
  let reqData = req.body;
  let reqRes = new CommitDiffsResponse();


  /**
   * 
   * @param {boolean} d 
   */
  let commitDone = (d) => {
    reqRes.success = d;
    res.send(reqRes);
  };
  GitCommit(reqData.message, commitDone)


});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



async function openGitRemote() {
  try {
    git = simpleGit(programVars.DataRootPath);

  } catch (e) {
    console.log(e);
  }
}

/**
 * @param {(arg0: string) => void}
 * @returns {String}
 */
async function GitDiff(callback) {
  let result = "";
  await git.diff()
    .then((x) => {
      console.log(x);
      let A = 1;
      if (!x) {
        console.log("no diffs");
      }
      else {
        result = x;
      }
      callback(result);
    });
}

async function GitCommit(message, callback) {
  try {
    await git.add('.');
    await git.commit(message);

    const remoteName = 'origin';
    const branchName = 'main';

    // Check if the remote is already set up
    const remotes = await git.getRemotes();
    const remoteExists = remotes.some(remote => remote.name === remoteName);

    if (!remoteExists) {
      const repositoryURL = 'your_repository_url'; // Replace with your repository URL
      await git.remote(['add', remoteName, repositoryURL]);
    }
    await git.push(remoteName, branchName);
    console.log('Pushed successfully');
    callback(true);
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    callback(false);
  }

}