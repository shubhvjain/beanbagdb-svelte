<script>
  import { onMount } from "svelte";
  import { JSONEditor } from 'svelte-jsoneditor'

  let loaded = $state(false)
  let {data, options, handle_change} = $props()
  let temp_data = $state({})

  onMount(()=>{
    loaded = false
    temp_data = {json:data||{}}
    loaded = true
  })

  const handle_change_form = (updatedContent, previousContent)=> {
   console.log(updatedContent, previousContent)
   try {
      if(updatedContent.text){
        let new_data = JSON.parse(updatedContent.text)
        handle_change({valid:true,data:new_data})
      }
      if(updatedContent.json){
        handle_change({valid:true,data:updatedContent.json})
      }
   } catch (error) {
      console.log(error)
      handle_change({valid:false,error:error})
   }
  }
</script>

{#if loaded}
<JSONEditor  content= {temp_data} onChange={handle_change_form} />
{/if}
