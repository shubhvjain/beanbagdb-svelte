<!-- the app space withing the document editor to modify certain settings -->
 <script>
  import { onMount } from "svelte";

  let {BBDB,bbdb_action,new_doc,schema_name,custom_app_editors,app_data=$bindable({}),on_update_click} = $props()
  let loaded = $state(false)
  onMount(()=>{
    custom_app_editors.map(itm=>{
      if(!app_data[itm.key]){
        app_data[itm.key] = {}
      }
    })
    loaded = true
  })

  const on_edit_update = (app)=>{
    console.log(app)
    console.log(app_data)
    if(on_update_click){
      let new_data  = {mode:app.update_mode||"update",data:app_data[app.key]}
      let app_update = {}
      let key = app.key
      app_update[key] = new_data
      //console.log({})
      on_update_click(app_update)
    }
  }

  const on_delete = async (app)=>{
    console.log(app)
    console.log(app_data)
    if(on_update_click){
      let new_data  = {mode:"remove",data:app_data[app.key]}
      let app_update = {}
      let key = app.key
      app_update[key] = new_data
      //console.log({})
      try {
        await on_update_click(app_update)
        app_data[app.key] = {}  
      } catch (error) {
        console.log(error)
      }
      
    }
  }
 </script>

{#if loaded}
{#if new_doc}
  <div class="row mt-2">
    <div class="col-lg-12">
    {#each custom_app_editors as app }
     
      <app.component {schema_name} {new_doc}   bind:value={app_data[app.key]} {BBDB} />
    {/each}
    </div>
  </div>
  
{:else}  
 
  <div class="row mt-2">
    <div class="col-lg-12">
    {#each custom_app_editors as app }
      <div class="mt-2">
        <app.component {new_doc} bind:value={app_data[app.key]} {BBDB} {schema_name} emit_update={()=>on_edit_update(app)} />
      <div>
        <!-- <button class="btn btn-sm btn-secondary" onclick={()=>on_edit_update(app)}>Update app settings</button>
        {#if app?.show_remove}
          <button class="btn btn-sm btn-danger" onclick={()=>on_delete(app)} >{app.remove_message||"Remove"}</button>
        {/if} -->
      </div>
      
      </div>
    {/each}
    </div>
  </div>
{/if}  
{/if}
