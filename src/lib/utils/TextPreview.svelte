<script>
  import { onMount } from "svelte";
  import katex from "katex";
  import "katex/dist/katex.min.css";
  import renderMathInElement from "katex/dist/contrib/auto-render.mjs";

  let {text = $bindable("")}  = $props()  // Input text
  let previewContainer = $state(null)

  //let processedHtml = ""; // Holds the final processed HTML
  let processedHtml = $derived(processText(text));
  function processText(inputText) {
    // Convert new lines to <br>
    let htmlText = inputText.replace(/\n/g, "<br>");

    // Create a container to process KaTeX
    let container = document.createElement("span");
    container.innerHTML = htmlText;

    // Auto-render KaTeX (both inline and display)
    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },  // Display mode
        { left: "$", right: "$", display: false }    // Inline mode
      ],
      throwOnError: false
    });

    return container.innerHTML;
  }

  onMount(() => {
    //processedHtml = processText(text);
  });
  
  // Watch for changes in text and reprocess
</script>

<div class="preview" bind:this={previewContainer}>{@html processedHtml}</div>
