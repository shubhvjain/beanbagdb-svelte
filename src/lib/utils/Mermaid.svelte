<script>
  import { onMount } from "svelte";
  import mermaid from "mermaid";

  let { diagram = "  " } = $props();
  let container;
  let id = $state("");

  async function renderDiagram() {
      if (container) {
          const uniqueId = `mermaid-${id}`;
          const { svg } = await mermaid.render(uniqueId, diagram);
          container.innerHTML = svg;
      }
  }

  onMount(() => {
    id = "id" + Math.floor(Math.random() * 10000); // Ensure uniqueness
    mermaid.initialize({ theme: 'neutral' });

    setTimeout(() => {
      renderDiagram();
    }, 100);
  });
</script>

<span id={id} bind:this={container}></span>