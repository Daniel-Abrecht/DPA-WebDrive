"use strict";

class ContextMenu {

  constructor( w ){
    if( w.contextMenu )
      return w.contextMenu;
    w.contextMenu = this;
    var root = document.createElement("div");
    root.style.position = "fixed";
    root.style.width = 0;
    root.style.height = 0;
    root.style.display = 'none';
    root.style.zIndex = 1000;
    root.classList.add("ContextMenu");
    w.document.body.appendChild( root );
    this.root = root;
    w.addEventListener("mousedown",(e)=>this.onmousedown(e));
    w.addEventListener("contextmenu",(e)=>this.onContextMenu(e));
  }

  onContextMenu( event ){
    var et = event.target;
    for ( et; et && !et.menu && !et.dataset.noContextMenu; et=et.parentElement );
    if( !et || et.dataset.noContextMenu || et.menu == window )
      return true;
    event.preventDefault();
    contextMenu.show( et.menu, event.clientX, event.clientY );
    return false;
  }

  show( context, x, y ){
    var that = this;
    function build( c ){
      var option, key;
      function mkOption( tag ){
        option = document.createElement(tag);
        option.classList.add("Option");
        option.appendChild(document.createTextNode(key));
      }
      var menu = document.createElement("div");
      menu.classList.add("Menu");
      for( key in c ){
        var value = c[key];
        if( value instanceof Function ){
          mkOption("div");
          option.classList.add("active");
          option.classList.add("hasFunction");
          option.addEventListener("click",function(){
            that.hide();
            value();
          });
        }else if( typeof value == "string" ){
          mkOption("a");
          option.classList.add("active");
          option.classList.add("link");
          var isDownload = value.substr(0,9) == "download:";
          option.href = value.substr(9);
          if( isDownload ){
            option.classList.add("download");
            option.setAttribute("download",option.pathname.match(/([^/]*)\/?$/)[1]);
          }
        }else if( value ){
          mkOption("div");
          option.classList.add("hasSubmenu");
          option.appendChild( build(value) );
        }else{
          mkOption("div");
          option.classList.add("inactive");
        }
        menu.appendChild(option);
      }
      return menu;
    }
    var menu = build( context );
    this.root.style.top  = y + "px";
    this.root.style.left = x + "px";
    this.root.style.display = "block";
    this.root.innerHTML = '';
    this.root.appendChild( menu );
  }

  hide(){
    this.root.innerHTML = '';
    this.root.style.display = "none";
  }

  onmousedown( event ){
    for( var e=event.target; e && !e.classList.contains("ContextMenu"); e=e.parentElement );
    if( !e ){
      contextMenu.hide();
    }
    return true;
  }

}
