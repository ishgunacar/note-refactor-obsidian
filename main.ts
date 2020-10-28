import {
  App,
  MarkdownView,
  Notice,
  Plugin,
} from "obsidian";

export default class NoteRefactor extends Plugin {
  onInit() {}

  onload() {
    console.log("Loading Note Refactor plugin");

    this.addCommand({
      id: 'app:extract-selection',
      name: 'Extract selection to new note',
      callback: () => this.extractSelection(),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "n",
        },
      ],
    });
  }

  onunload() {
    console.log("Unloading Note Refactor plugin");
  }

  extractSelection(): void {
      const markdownSourceView = this.app.workspace.activeLeaf.getViewState();
      const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
      if(!mdView) {return}
      const doc = mdView.sourceMode.cmEditor;
      const selectedText = doc.getSelection()

      if (!selectedText) { return }

      var _a = selectedText.split('\n'), header = _a[0], contentArr = _a; //doesn't splice header anymore
      //if first char of first substring is letter, adds header.
      //TODO: Check for subheadings and replace with just a #; check for ol or ul and add new line with blank header (# /n)
      if ((/[a-zA-Z]/).test(contentArr[0].charAt(0)) ) {
      contentArr[0] = "# " + contentArr[0];
      }
      const rootFolder = this.app.vault.getRoot();

      let headerRegex = /[^\w\s_-]+/gim;

      //TODO: Use file path settings
      let fileName = header.replace(headerRegex, '').trim();
      let filePath = fileName + '.md';
      this.app.vault.adapter.exists(filePath, false).then((exists) => {
        if(exists){
          console.log('File exists!')
          new Notice(`A file namde ${fileName} already exists`);
          return;
        } else {
          this.app.vault.create(filePath, contentArr.join('\n').trim()).then((newFile) => {
            doc.replaceSelection(`[[${fileName}]]`);
            this.app.workspace.openLinkText(fileName, filePath, true);
          });
        }
      });
  }
}
