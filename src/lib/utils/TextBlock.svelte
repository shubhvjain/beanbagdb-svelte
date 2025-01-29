<script>
  import { onMount } from "svelte";
  import {
    EditorView,
    keymap,
    drawSelection,
    dropCursor,
  } from "@codemirror/view";
  import { EditorState } from "@codemirror/state";
  import {
    indentWithTab,
    defaultKeymap,
    history,
    historyKeymap,
  } from "@codemirror/commands";
  import { searchKeymap, search } from "@codemirror/search";
  import {
    bracketMatching,
    foldKeymap,
    codeFolding,
    syntaxHighlighting,
  } from "@codemirror/language";
  import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";

  let {
    text = " ",
    onContentChange,
    validation,
    isValid = true,
    editorOptions = {},
  } = $props();

  let editorContainer;
  let view;

  onMount(() => {
    let default_method = (text) => {
      return text;
    };
    if (!validation) {
      validation = default_method;
    }
    if (!onContentChange) {
      onContentChange = default_method;
    }

    view = new EditorView({
      state: EditorState.create({
        doc: text,
        extensions: [
          keymap.of([
            indentWithTab,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...closeBracketsKeymap,
            ...foldKeymap,
          ]),
          search(),
          history(),
          bracketMatching(),
          drawSelection(),
          dropCursor(),
          codeFolding(),
          closeBrackets(),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              text = update.state.doc.toString();
              isValid = validation(text);
              onContentChange(text);
            }
          }),
        ],
      }),
      parent: editorContainer,
    });
  });
</script>

<div class="editor-wrapper">
  <div bind:this={editorContainer} class="codemirror-editor"></div>
  {#if !isValid}
    <p class="text-danger">Invalid content</p>
  {/if}
</div>

<style>
  .editor-wrapper {
    position: relative;
    width: 100%;
  }
</style>
