"use strict";

class DirectoryEntry {

  constructor( dm, file ){
    this.info = file;
    var a = document.createElement("a");
    a.href = file.href;
    a.draggable = true;
    a.classList.add("DirectoryEntry");
    if( file.type == "inode/directory" ){
      a.dataset.path = file.href;
      a.classList.add("Directory");
    }else{
      a.classList.add("File");
    }
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(file.name));
    a.appendChild(span);
    this.root = a;
  }

  getRoot(){
    return this.root;
  }

}

class DirectoryUIManager {

  constructor( fs ){
    this.fs = fs;
    this.root = document.createElement("div");
    this.path = null;
  }

  getRoot(){
    return this.root;
  }

  goto( path ){
    var that = this;
    return new Promise(function(resolve,reject){
      that.fs.listDir( path ).then(function(dir){
        that.root.dataset.path = dir.info.href;
        for( var file of dir.files ){
          var e = new DirectoryEntry(that,file);
          that.addEntry(e);
        }
        resolve(dir);
      },reject);
    });
  }

  addEntry(e){
    this.root.appendChild( e.getRoot() );
  }

};
