"use strict";

class DragAndDropHandler {

  constructor( target, fileManager ){
    this.target = target;
    this.fileManager = fileManager;
    this.currentHover = null;
    this.registerEventHandler();
  }

  ondrop( event ){
    this.ondragoverchange( event, null, event.target||null );
    var e = Utils.findFirstParentElementWithAttribute( event.target, "data-path" );
    if(!e) return;
    var uriList = event.dataTransfer.getData("text/uri-list");
    if( uriList && uriList != "" ){
      var uriList = uriList.replace(/^#[^\n]*\r\n/gm,'').trim().split("\r\n");
      if( uriList.length ){
        switch( event.dataTransfer.dropEffect ){
          case "link": this.fileManager.link( uriList, e.dataset.path ); break;
          case "copy": this.fileManager.copy( uriList, e.dataset.path ); break;
          default: this.fileManager.move( uriList, e.dataset.path ); break;
        }
      }
    }else{
      this.fileManager.upload( e.dataset.path, event.dataTransfer );
    }
  }

  ondropzoneenter( event, e ){
    e.classList.add("dragover");
  }

  ondropzoneleave( event, e ){
    e.classList.remove("dragover");
  }

  ondragstart( event ){
    this.ondragoverchange( event, event.target||null, null );
    var e = Utils.findFirstParentElementWithAttribute( event.target, "data-path" );
    if(e){
      event.dataTransfer.setData("text/uri-list",e.dataset.path+"\r\n");
    }
  }

  ondragend( event ){
    this.ondragoverchange( event, null, event.target||null );
  }

  ondragoverchange( event, n, o ){
    var ne = Utils.findFirstParentElementWithAttribute( n, "data-path" );
    var oe = Utils.findFirstParentElementWithAttribute( o, "data-path" );
    if( ne == oe || this.currentHover == ne )
      return false;
    if( oe )
      this.ondropzoneleave( event, this.currentHover );
    this.currentHover = ne;
    if( ne )
      this.ondropzoneenter( event, ne );
    return true;
  }

  ondragenter( event ){
    this.ondragoverchange( event, event.target||null, event.relatedTarget||null );
  }

  ondragleave( event ){
    this.ondragoverchange( event, event.relatedTarget||null, event.target||null );
  }

  registerEventHandler(){
    this.target.addEventListener( "dragstart", (event)=>this.ondragstart(event), true );
    for( var event of [
      "dragover",
      "dragend",
      "dragenter",
      "dragleave",
      "drop"
    ]) this.target.addEventListener(
         event, Utils.preventEventHandlerFactory(this["on"+event],this), true
       );
  }

}