import { Component, ElementRef, viewChild, input, output, effect } from '@angular/core';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.css',
})
export class RichTextEditor {
  html = input('');
  rtl  = input(false);

  htmlChange = output<string>();

  private editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');

  constructor() {
    effect(() => {
      const value = this.html();
      const ref = this.editorRef();
      if (!ref) return;
      const el = ref.nativeElement;
      // Only push external changes in — never while the user is actively editing,
      // or every keystroke's own echo would reset the cursor to the start.
      if (document.activeElement !== el && el.innerHTML !== value) {
        el.innerHTML = value;
      }
    });
  }

  onInput(): void {
    const ref = this.editorRef();
    if (!ref) return;
    this.htmlChange.emit(ref.nativeElement.innerHTML);
  }

  private exec(command: string, value?: string): void {
    const ref = this.editorRef();
    if (!ref) return;
    ref.nativeElement.focus();
    document.execCommand(command, false, value);
    this.onInput();
  }

  bold(): void       { this.exec('bold'); }
  italic(): void      { this.exec('italic'); }
  bulletList(): void  { this.exec('insertUnorderedList'); }
  clear(): void       { this.exec('removeFormat'); }

  link(): void {
    const url = window.prompt('Link URL:', 'https://');
    if (!url) return;
    this.exec('createLink', url);
  }

  inlineCode(): void {
    const ref = this.editorRef();
    if (!ref) return;
    ref.nativeElement.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const code = document.createElement('code');
    try {
      range.surroundContents(code);
    } catch {
      const contents = range.extractContents();
      code.appendChild(contents);
      range.insertNode(code);
    }
    sel.removeAllRanges();
    this.onInput();
  }
}
