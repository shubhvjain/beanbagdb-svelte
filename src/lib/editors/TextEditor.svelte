<script>
  import { onMount } from "svelte";
 import TextBlock from "$lib/utils/TextBlock.svelte";
 import TextPreview from "$lib/utils/TextPreview.svelte";
  let {
    data = $bindable({}),
    schema = {},
    mode = "view",
    new_doc = false,
    BBDB,
    bbdb_action,
    data_valid = $bindable(),
  } = $props();

  let loaded = $state(false);

  onMount(() => {
    loaded = true;
  });
  const validate= (text)=>{
    if(text.trim().length==0){
      data_valid = false
      return {valid:false,error:"No text provided"}
    }else{
      data_valid = true
      return {valid:true}
    }
    
  }
</script>

{#if mode == "edit"}
  <TextBlock   isValid={data_valid} onContentChange={validate} bind:text={data.text}  />
{:else if mode == "view"}
<div class="pt-3">
  <TextPreview text={data.text}/>
</div>
{/if}