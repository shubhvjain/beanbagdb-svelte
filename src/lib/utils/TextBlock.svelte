<script>
  import { onMount } from "svelte";
  import {
    EditorView,
    keymap,
    drawSelection,
    dropCursor,
    placeholder
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


const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
  },
  ".cm-content": {
    caretColor: "#ffffff",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#ffffff",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#3a3d41",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e1e",
    color: "#858585",
    border: "none",
  },
});



  let {
    text = $bindable(),
    onContentChange,
    validation,
    isValid= $bindable(true) ,
    editorOptions = {},
  } = $props();

  let editorContainer;
  let view;
  let error_message = $state("Invalid content")

  onMount(() => {
    let default_method = (text) => {
      return text;
    };
    if (!validation) {
      validation = (text)=>{
        return {valid:true,text:text,errors:[]}
      };
    }
    if (!onContentChange) {
      onContentChange = default_method;
    }

    view = new EditorView({
      state: EditorState.create({
        doc: text,
        extensions: [
          darkTheme, 
          placeholder("Add text here"), // Placeholder text
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
              let check_validity=  validation(text)
              //console.log(check_validity)
              let required_keys =["valid","text","errors"]
              if( check_validity.hasOwnProperty("valid") && typeof check_validity.valid === "boolean"){
                isValid = check_validity.valid
                if(isValid==false){
                  error_message = check_validity.errors.join(".")
                }
                onContentChange(text);
              }else{
                throw new Error("Validation function is invalid")
              }
              
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
    <p class="text-danger">{error_message}</p>
  {/if}
</div>

<style>
  .editor-wrapper {
    position: relative;
    width: 100%;
  }
</style>
