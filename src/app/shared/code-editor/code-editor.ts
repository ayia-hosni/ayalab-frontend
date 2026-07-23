import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, input, output, effect } from '@angular/core';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

export type EditorLang = 'javascript' | 'python' | 'java';

const LANGUAGES: Record<EditorLang, () => import('@codemirror/state').Extension> = {
  javascript: () => javascript(),
  python: () => python(),
  java: () => java(),
};

const editorTheme = EditorView.theme({
  '&': { backgroundColor: '#1E1E2E', color: '#CBD5E1', fontSize: '13px', height: '100%' },
  '.cm-content': { fontFamily: 'var(--mono)', caretColor: '#CBD5E1', padding: '20px 20px 20px 0' },
  '.cm-scroller': { fontFamily: 'inherit', lineHeight: '1.7' },
  '&.cm-focused': { outline: 'none' },
  '.cm-gutters': { backgroundColor: '#1E1E2E', color: '#4B5264', border: 'none', paddingLeft: '12px' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.04)', color: '#94A3B8' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(139,92,246,0.35) !important' },
  '.cm-cursor': { borderLeftColor: '#CBD5E1' },
  '.cm-foldPlaceholder': { backgroundColor: '#2D3543', border: 'none', color: '#94A3B8' },
}, { dark: true });

@Component({
  selector: 'app-code-editor',
  standalone: true,
  template: `<div #host class="cm-host"></div>`,
  styles: [`
    :host { display: block; height: 100%; }
    .cm-host { height: 100%; }
    .cm-host ::ng-deep .cm-editor { height: 100%; }
  `],
})
export class CodeEditor implements AfterViewInit, OnDestroy {
  @ViewChild('host') hostRef!: ElementRef<HTMLDivElement>;

  value = input('');
  language = input<EditorLang>('javascript');
  readOnly = input(false);

  valueChange = output<string>();

  private view: EditorView | null = null;
  private languageConf = new Compartment();
  private readOnlyConf = new Compartment();

  constructor() {
    // Push external value changes (reset, language switch) into the doc —
    // guarded by an equality check so the editor's own change-driven emits
    // (below, in the update listener) never bounce back and reset the cursor.
    effect(() => {
      const value = this.value();
      if (this.view && value !== this.view.state.doc.toString()) {
        this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: value } });
      }
    });

    effect(() => {
      const lang = this.language();
      const ro = this.readOnly();
      this.view?.dispatch({
        effects: [
          this.languageConf.reconfigure(LANGUAGES[lang]()),
          this.readOnlyConf.reconfigure([EditorState.readOnly.of(ro), EditorView.editable.of(!ro)]),
        ],
      });
    });
  }

  ngAfterViewInit(): void {
    const state = EditorState.create({
      doc: this.value(),
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        editorTheme,
        this.languageConf.of(LANGUAGES[this.language()]()),
        this.readOnlyConf.of([EditorState.readOnly.of(this.readOnly()), EditorView.editable.of(!this.readOnly())]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            if (text !== this.value()) this.valueChange.emit(text);
          }
        }),
      ],
    });
    this.view = new EditorView({ state, parent: this.hostRef.nativeElement });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }
}
