"use strict";

class Utils {

  static findFirstParentElementWithAttribute( e, name ){
    if(!(e instanceof Node))
      return null;
    while( e && ( !("hasAttribute" in e) || !e.hasAttribute(name) ) )
      e = e.parentNode;
    return e || null;
  }

  static preventEventHandlerFactory( f, target ){
    return function( event ){
      event.preventDefault();
      try {
        event.relatedTarget && event.relatedTarget.bla; // Detect firefox bug
      } catch(e) {
        console.error( "I shouldn't see this node in the first place:", event.relatedTarget );
        return;
      }
      if(f)
        f.call( target || this, event );
      return false;
    };
  }

  static getURIInfo( path ){
    var a = document.createElement("a");
    a.href = path;
    return {
      uri: a.href,
      name: a.pathname.match(/([^\/]*)\/?$/)[1]
    };
  }

}
