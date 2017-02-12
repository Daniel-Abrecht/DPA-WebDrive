"use strict";

class DirectoryEntry {

  constructor( dm, file ){

    this.info = file;
    var a = document.createElement("a");
    a.entry = this;
    var href = file.href;
    a.href = href;
    this.info = file;
    a.draggable = true;
    a.classList.add("DirectoryEntry");
    if( file.type == "inode/directory" ){
      a.dataset.path = file.href;
      a.classList.add("Directory");
    }else{
      a.classList.add("File");
    }

    a.getURI = function(){
      var t = Math.floor( ( new Date().getTime()/1000 + dm.stdiff ) / 30 );
      var et = JSON.parse(file.etag).split('-').slice(-2);
      et[1] = et[1].substr( 0, et[1].length-6 );
      et.push(t);
      et = et.join('-');
      var token = sha1( et );
      var a2 = document.createElement("a");
      a2.href = a.href;
      a2.search = a2.search + ( a2.search ? '&' : '?' ) + 'token=' + encodeURIComponent( token );
      return a2.href;
    };

    var icon = document.createElement("span");
    icon.classList.add("icon");
    a.appendChild(icon);

    var name = document.createElement("span");
    name.classList.add("name");
    name.appendChild(document.createTextNode(file.name));
    a.appendChild(name);

    a.menu = {
      "Download": "download:" + href,
      "Delete": ()=>dm.fs.remove(href)
    };

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
    this.root.classList.add("DirectoryUI");
  }

  getRoot(){
    return this.root;
  }

  goto( path ){
    var that = this;
    return new Promise(function(resolve,reject){
      that.fs.listDir( path ).then(function(dir){
        that.root.dataset.path = dir.info.href;
        that.root.entry = that;
        that.info = dir.info;
        that.stdiff = Math.floor( new Date().getTime()/1000 - dir.time );
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
