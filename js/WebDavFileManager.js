"use strict";

class WebDavFileManager {

  upload( path, datatransfer ){
    console.log( "upload", path, datatransfer );
  }

  move( srcList, destination ){
    console.log( "move", srcList, destination );
  }

  link( srcList, destination ){
    console.log( "link", srcList, destination );
  }

  copy( srcList, destination ){
    console.log( "copy", srcList, destination );
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
