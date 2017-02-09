"use strict";

class WebDavFileManager {

  getOpSrc( srcList, destination ){
    for( var s of srcList ){
      if( /https?:\/\//.test(s) ){
        src = s;
        break;
      }
    }
    if( !src )
      return null;
    var a1 = document.createElement("a");
    var a2 = document.createElement("a");
    for( var src of srcList ){
      a1.href = src;
      a2.href = destination;
      if( a1.origin + a1.pathname == a2.origin + a2.pathname )
        return false;
    }
    return src;
  }

  upload( path, datatransfer ){
    console.log( "upload", path, datatransfer );
    Array.from(datatransfer.files).forEach( (x)=>this.uploadFile(x,path) );
  }

  uploadFile( file, path ){
    var a = document.createElement("a");
    a.href = path;
    var dst = a.origin + a.pathname + file.name + a.search
    return new Promise(function(resolve,reject){
      try {
        var xhr = new XMLHttpRequest();
        xhr.open( "PUT", dst, true );
        xhr.onerror = function(error){
          reject(error.error||error);
        };
        xhr.onload = function(){
          if( ((this.status/100)|0) != 2 ){
            reject(new Error(this.status+' '+this.statusText));
            return;
          }
          resolve("OK");
        }
        xhr.setRequestHeader( "Overwrite", "F" );
        xhr.send(file);
      } catch(e){
        reject(e);
      }
    });
  }

  move( srcList, destination ){
    var src = this.getOpSrc( srcList, destination );
    if( !src )
      return false;
    var res = this.mkmove( src, destination );
    res.then(x=>console.log(x),x=>console.error(x));
    return true;
  }

  link( srcList, destination ){
    var src = this.getOpSrc( srcList, destination );
    if( !src )
      return false;
    console.log( "link", src, destination );
    return true;
  }

  copy( srcList, destination ){
    var src = this.getOpSrc( srcList, destination );
    if( !src )
      return false;
    var res = this.mkcopy( src, destination );
    res.then(x=>console.log(x),x=>console.error(x));
    return true;
  }

  mkcopy( src, dst ){
    return this.dav2op( "COPY", src, dst );
  }

  mkmove( src, dst ){
    return this.dav2op( "MOVE", src, dst );
  }

  dav2op( op, src, dst ){
    var asrc = document.createElement("a");
    var adst = document.createElement("a");
    asrc.href = src;
    adst.href = dst;
    if( /\/$/.test(adst.pathname) )
      adst.pathname += asrc.pathname.match(/([^/]+)\/?$/)[1];
    if( asrc.origin != adst.origin )
      return Promise.reject(new Error("Copy across different origins unsupported"));
    return new Promise(function(resolve,reject){
      try {
        var xhr = new XMLHttpRequest();
        xhr.open( op, src, true );
        xhr.onerror = function(error){
          reject(error.error||error);
        };
        xhr.onload = function(){
          if( ((this.status/100)|0) != 2 ){
            reject(new Error(this.status+' '+this.statusText));
            return;
          }
          resolve("OK");
        }
        xhr.setRequestHeader( "Destination",  adst.href );
        xhr.setRequestHeader( "Overwrite", "F" );
        xhr.send();
      } catch(e){
        reject(e);
      }
    });
  }

  listDir( path ){
    var apath = document.createElement("a");
    apath.href = path;
    return new Promise(function(resolve,reject){
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("PROPFIND",path,true);
        xhr.onerror = function(error){
          reject(error.error||error);
        };
        xhr.onload = function(){
          if( ((this.status/100)|0) != 2 ){
            reject(new Error(this.status+' '+this.statusText));
            return;
          }
          var cwd = null;
          var result = [];
          var list = Array.from( this.responseXML.documentElement.children );
          var gp=function(x){
            return (entry.getElementsByTagName(x)[0]||{}).textContent || null;
          }
          for( var entry of list ){
            var href = gp("D:href");
            var type = gp("D:getcontenttype");
            var isDirectory = !!entry.getElementsByTagName("lp1:resourcetype")[0].getElementsByTagName("D:collection").length;
            var size = gp("lp1:getcontentlength");
            var etag = gp("lp1:getetag");
            var creationdate = gp("lp1:creationdate");
            var lastmodified = gp("lp1:getlastmodified");
            if( isDirectory )
              type = "inode/directory";
            var a = document.createElement("a");
            a.href = href;
            var e = {
              name: decodeURIComponent(href.match("([^/]*)/?$")[1]),
              href,
              type,
              size,
              etag,
              creationdate,
              lastmodified
            };
            if( a.pathname == apath.pathname ){
              cwd = e;
            }else{
              result.push(e);
            }
          }
          resolve({
            time: new Date( this.getResponseHeader("Date") ).getTime()/1000,
            info: cwd,
            files: result
          });
        };
        var xml = document.implementation.createDocument("DAV:","a:propfind");
        var prop = xml.createElement("a:prop");
        xml.documentElement.appendChild(prop);
        var padd = function(x){
          var resourcetype = xml.createElement(x);
          prop.appendChild(resourcetype);
        };
        padd("a:getcontenttype");
        padd("a:resourcetype");
        padd("a:getcontentlength");
        padd("a:getetag");
        padd("a:creationdate");
        padd("a:getlastmodified");
        xhr.overrideMimeType("text/xml");
        xhr.setRequestHeader("Depth",1);
        xhr.send(xml);
      } catch(e){
        reject(e);
      }
    });
  }

}
