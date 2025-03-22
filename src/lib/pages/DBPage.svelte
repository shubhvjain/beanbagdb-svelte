<script>
  // this component is used to show all pages for the "page" text command. this can be used in any ui interface
  let { BBDB, page, page_bbdb_action } = $props();
  import "../default.style.css";
  import { onMount } from "svelte";
  // import {emit_bbdb_event} from "$lib/bbdb_actions.js"

  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";
  import LogViewer from "$lib/utils/LogViewer.svelte";
  import TableViewer from "$lib/utils/TableViewer.svelte";

  import Help from "$lib/pages/Help.svelte";
  import SearchPage from "$lib/pages/DBSearch.svelte";

  let loaded = $state(false);
  let data = $state();

  function emit_bbdb_to_parent(data){
    if(page_bbdb_action){
      page_bbdb_action(data)
    }else{
      console.log(data)
    }
  }

  const labels = {
    info_obj: {
      database_name: { label: "Database Name", help: "Name of the database." },
      backend_database: {
        label: "Backend Database",
        help: "Type of backend database used.",
      },
      beanbagdb_version_db: {
        label: "Database Version",
        help: "Version of the database schema.",
      },
      beanbagdb_version_code: {
        label: "Code Version",
        help: "Version of the application code.",
      },
      ready_to_use: {
        label: "Ready to Use",
        help: "Indicates if the system is ready to use.",
      },
    },
    key_table: {
      name: {
        title: "Name",
        info: "The unique name or identifier for the item.",
      },
      note: {
        title: "Description",
        info: "Details or explanation about the item's purpose or functionality.",
      },
      link: {
        title: "Link",
        info: "An identifier or tag for additional reference or usage.",
      },
    },
    setting_table: {
      name: {
        title: "Name",
        info: "The unique name or identifier for the item.",
      },
      value: {
        title: "Value",
        info: "Details or explanation about the item's purpose or functionality.",
      },
      link: {
        title: "Link",
        info: "An identifier or tag for additional reference or usage.",
      },
    },
    schema_table: {
      name: {
        title: "Name",
        info: "The unique name or identifier for the item.",
      },
      version: {
        title: "Version",
        info: "The version number of the item.",
      },
      system_defined: {
        title: "System Defined",
        info: "Indicates whether the item is defined by the system.",
      },
      description: {
        title: "Description",
        info: "Details or explanation about the item's purpose or functionality.",
      },
      link: {
        title: "Link",
        info: "An identifier or tag for additional reference or usage.",
      },
    },
  };
  const titles = {
    info: "Database information",
    help: "Help topics",
    search: "Search the database",
    keys: "Keys added to the database",
    settings: "Database settings",
    schemas: "List of schemas installed in the database",
    plugins: "List of plugins installed",
  };

  onMount(async () => {
    //console.log("here");
    //console.log(page);
    let dt = await BBDB.plugins["txtcmd"].parse_and_run(`page/${page.criteria.type}`);
    data = dt["result"];
    loaded = true;
  });
</script>

{#if loaded}
  <div class="container-fluid">
    <div class="row">
      <div class="col-lg-12">
        {#if page.criteria.type == "info"}
          <h3>{titles[page.criteria.type]}</h3>
          <ObjectViewer
            title="Metadata"
            data={data.meta}
            labels={labels.info_obj}
          />
          <LogViewer logs={data["logs"]} />
        {/if}
        {#if page.criteria.type == "help"}
        <h3>{titles[page.criteria.type]}</h3>
          <Help params={page.criteria.params}  />
        {/if}
        {#if page.criteria.type == "search"}
          <h3>{titles[page.criteria.type]}</h3>
          <SearchPage {BBDB} page_bbdb_action={emit_bbdb_to_parent} />
        {/if}

        {#if page.criteria.type == "plugins"}
          <h3>{titles[page.criteria.type]}</h3>
        {/if}
        {#if page.criteria.type == "keys"}
          <h3>{titles[page.criteria.type]}</h3>
          <TableViewer data={data.docs} labels={labels.key_table} bbdb_action={emit_bbdb_to_parent}  />
        {/if}
        {#if page.criteria.type == "settings"}
          <h3>{titles[page.criteria.type]}</h3>
          <TableViewer data={data.docs} labels={labels.setting_table} bbdb_action={emit_bbdb_to_parent}   />
        {/if}

        {#if page.criteria.type == "schemas"}
          <h3>{titles[page.criteria.type]}</h3>
          <TableViewer data={data.docs} labels={labels.schema_table} bbdb_action={emit_bbdb_to_parent}  />
        {/if}
      </div>
    </div>
  </div>
{/if}
