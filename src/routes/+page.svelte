<script>
  import DBManager from "$lib/ui/DBManager.svelte";
  import * as PouchDB from "$lib/db/pouchdb.min.js";
  import * as PouchDBFind from "$lib/db/pouchdb.find.js";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  let PouchDBState = $state(null)
  let loaded = $state(false)
  onMount(async()=>{
    if (browser) {
      PouchDBState = window.PouchDB;
      loaded = true;
    }
  })

  let temp = {}
</script>
{#if loaded}
<div class="container">
  <nav class="navbar navbar-light bg-light mb-2">
    <span class="navbar-brand mb-0 h1">BBDB</span>
  </nav>
  <!-- {JSON.stringify(temp,null,2)} -->
  <DBManager  PouchDB={PouchDBState} bbdb_action={(details)=>{
    temp = details
    console.log(details)
    }} 
    
    on_link_click = {
      (data)=>{
        if(data.page=="workspace"){
          window.open(`ws/${data.db_name}`)
        }
      
      }
    }
  />
</div>
{/if}