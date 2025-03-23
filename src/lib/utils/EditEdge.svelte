<script>
  import { onMount } from "svelte";

  let {BBDB,bbdb_action,edge_id} = $props()
  import {emit_bbdb_event} from "$lib/bbdb_actions.js" 
  let loaded = $state(false)
  let message  = $state("")
  let selected_name = $state(null)
  let selected_level_weight = $state(1)
  let edge_names = $state([])
  let data = $state({})
  onMount(async()=>{
    try {
      loaded=false
      message="Loading..."
      data = await BBDB.read({"_id":edge_id})
      selected_name = data.doc.data.edge_name
      selected_level_weight = data.doc.data?.level_weight
      let edge_c_search = await BBDB.search({"selector":{"schema":"system_edge_constraint"}})
      console.log(edge_c_search)
      edge_names = edge_c_search?.docs||[]
      console.log(data)
      loaded=true
      //message="Edge label cannot be updated.Delete this edge and create a new one"
      message="Edit edge label. You can select from the list of edge names defined in the database. Note that they may be subject to constraints"
    } catch (error) {
      loaded=false
      message = error.message
      console.log(error)

    }
  })


  const save_edge = async ()=>{
    
    //if(selected_name != data.doc.data.edge_name){
      try {
        message = "Saving..."

        let update = await BBDB.update({
          "criteria":{"_id":edge_id},
          "updates":{
            "data":{
              "edge_name":selected_name,
              "level_weight":selected_level_weight
            }
          },
          "rev_id":data.doc._rev
        })
       //console.log(update)
       
        let updated_read = await BBDB.read({"_id":edge_id})
        //console.log(updated_read)
        await bbdb_action(emit_bbdb_event("edge_updated",{id:edge_id,
          source:updated_read.doc.data.node1,
          edge_name:selected_name,
          target:updated_read.doc.data.node2,
          level_weight:selected_level_weight
        }))
        message = "Edge label updated..."

      } catch (error) {
        message = error.message
        console.log(error)
      }
    //}else{}
    //if()
  }

  const delete_edge = async ()=>{
    let a = confirm("Sure?")
    if(a){
      try {
      let dele = await BBDB.delete({"_id":edge_id})
      await bbdb_action(emit_bbdb_event("edge_deleted",{id:edge_id}))
      message="Edge deleted"
      loaded= false
    } catch (error) {
      console.log(error)
      message = error.message
    }
    }
   
  }
</script>
{message}
{#if loaded}

<input type="text" list="suggestions"  bind:value={selected_name} class="form-control" placeholder="Type or select..." />

<datalist id="suggestions">
  {#each edge_names as suggestion}
    <option value={suggestion.data.name}></option>
  {/each}
</datalist>
<input type="number"   bind:value={selected_level_weight} class="form-control" placeholder="Level weight" />

<button class="btn btn-sm btn-primary p-1 m-1" onclick={save_edge}>Save</button>

<button class="btn btn-sm btn-danger p-1 m-1" onclick={delete_edge}>Delete</button>


{/if}