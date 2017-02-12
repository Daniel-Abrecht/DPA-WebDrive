"use strict";

const fs = new WebDavFileManager();
const dragAndDropHandler = new DragAndDropHandler( window, fs );
const dm = new DirectoryUIManager(fs);
new ContextMenu(window);

document.body.appendChild(dm.getRoot());
dm.goto(location.href);
