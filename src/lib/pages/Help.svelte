

<script>
  import { onMount } from "svelte";
  let {params} = $props()
  let topic = $state("start")
  onMount(()=>{
    topic = params?.topic || "begin"
  })


  const toc = [
    {
      key:"begin",
      title:"List all help topics"
    }
  ]
  const load_topic = (key)=>{
    topic = key
  }
  const all_topics = [
    {
      key:"ws_into",
      title:"Intro to the workspace"
    }
  ]
</script>
<div>
  <ul>
    
    <li>
      {#each toc as t }
      <button onclick={load_topic(t.key)} >{t.title}</button>
    {/each}
    </li>
  </ul>
</div>


{#if topic=="begin"}
<div>
  <h4>List of all help topics</h4>
  <ul>
    {#each all_topics as tpk }
    <li> {tpk.title}  <button onclick={load_topic(tpk.key)}>View</button></li>   
    {/each}
   
  </ul>
</div>
{/if}