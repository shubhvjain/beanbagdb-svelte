<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event } from "$lib/bbdb_actions.js";
  let { BBDB, page, page_bbdb_action } = $props();
  let loading = $state(true);

  let loaded = $state(false);
  let error = $state(null);
  let settings = $state({});
  let new_settings = $state({});

  let setting_schema = {}


  async function load_setting(page1) {
   
  }
  async function update_settings(new_settings){

  }


  onMount(async () => {
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      console.log(page);
      // documentData = await load_setting(page);
      console.log("111");
      loaded = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function on_bbdb_action(data) {
    if (page_bbdb_action) {
      page_bbdb_action(data);
    } else {
      console.log(data);
    }
  }
//       let valid_type = ["info","plugins","settings","keys","help","schemas","search"]

  const all_pages = [
    {
      command:"new",
      text:"Create a new document",
      icon:"bi bi-plus"
    },
    {
      command:"page/info",
      text:"View DB Info",
      icon:"bi bi-info"
    },
    {
      command:"page/plugins",
      text:"View and manage plugins",
      icon:"bi bi-plugin"
    },
    {
      command:"page/settings",
      text:"DB Settings",
      icon:"bi bi-gear"
    } ,
    {
      command:"page/keys",
      text:"Available Keys",
      icon:"bi bi-asterisk"
    },
    {
      command:"page/schemas",
      text:"List of schemas defined",
      icon:"bi bi-database"
    },
    {
      command:"page/search",
      text:"Search in the DB",
      icon:"bi bi-search"
    },
    {
      command:"page/help",
      text:"Help",
      icon:"bi bi-question"
    }

  ]

  function open_page(cmd){
    page_bbdb_action(emit_bbdb_event("textcmd",{text:cmd}))
  }

</script>

<div>
  {#if loading}
    <p>Loading document...</p>
  {:else if error}
    <p class="text-danger">Error: {error}</p>
  {:else if loaded }
  <div class="container-fluid">
    <h3>Workspace home</h3>
    <div class="list-group">
    

      {#each all_pages as pg }
        <button type="button" class="list-group-item list-group-item-action" onclick={()=>open_page(pg.command)}>  <i class="{pg.icon} m-2 "></i>  {pg.text}</button>
      {/each} 
    </div>
  </div>
   
  {/if}
</div>
