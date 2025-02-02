<script>
  import { onMount } from "svelte";
  import mermaid from "mermaid";
  let { diagram=$bindable()} = $props()

  let container;

  async function renderDiagram() {
      //console.log(diagram)
      if(container){
        const {svg} = await mermaid.render('mermaid', diagram)
        container.innerHTML=svg;
      }
  }
  // Initialize Mermaid on component mount
  onMount(() => {
    mermaid.initialize({
      theme: 'neutral',
    });
    console.log(diagram)
    setTimeout(()=>{
      renderDiagram();
    },100)
    
  });
 
</script>

<span bind:this={container}/>

