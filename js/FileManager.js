
class FileManager {

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

}
