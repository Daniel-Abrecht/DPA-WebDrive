"use strict";

const fs = new WebDavFileManager();
const dragAndDropHandler = new DragAndDropHandler( window, fs );
const dm = new DirectoryUIManager(fs);

document.body.appendChild(dm.getRoot());
dm.goto(location.href);
