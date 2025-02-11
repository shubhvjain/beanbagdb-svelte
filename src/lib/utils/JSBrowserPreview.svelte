<script>
  import { onMount } from "svelte";
  import Mermaid from "./Mermaid.svelte";
  function executeScript(script) {
    try {
      // Evaluate the script
      const result = eval(`(() => { ${script} })()`);

      // Check if the result is an object
      if (typeof result === "object" && result !== null) {
        return result;
      } else {
        throw new Error("Script did not return an object");
      }
    } catch (error) {
      console.error("Error executing script:", error.message);
      return null;
    }
  }

  let { script=$bindable() } = $props();
  let loaded = $state(false);
  let error = $state(false)
  let error_message = $state("")
  let script_result = $state(null)
  onMount(() => {
    try {
      let script_result1  = executeScript(script);
      console.log(script_result1)
      if(script_result1.hasOwnProperty("view")){
        error = false
        script_result =  script_result1
      }else{
        error_message = "Invalid script return value. No type defined"
        error = true
      }

      loaded = true
    } catch (error) {
      console.log(error);
    }
  });
</script>

{#if loaded}
  {#if error}
    <div class="alert alert-danger">
    {error_message}
    </div>
    
   {:else} 
    {#if script_result}

      {#if script_result.view=="mermaid"}
        <Mermaid diagram={script_result.diagram||""} />
      {/if}


    {/if}

  {/if}

{:else}
  Running...
  <pre><code>{script}</code></pre>
{/if}
