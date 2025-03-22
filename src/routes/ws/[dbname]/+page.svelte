<script>
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();
  let customUIPages = $state({
    sample: {
      component: Sample,
      title: "Sample Page",
    },
  });
  import { onMount } from "svelte";
  import Workspace from "$lib/ui/Workspace.svelte";
  import Sample from "$lib/pages/Sample.svelte";
  import { browser } from "$app/environment";
  import * as PouchDB from "$lib/db/pouchdb.min.js";
  import * as PouchDBFind from "$lib/db/pouchdb.find.js";

  let loaded = $state(false);
  let PouchDBState = $state(null);

  onMount(async () => {
    if (browser) {
      //const { PouchDB } = await import("pouchdb-browser");
      //console.log(window.PouchDB)
      PouchDBState = window.PouchDB;

      //console.log(PouchDB);
      loaded = true;
    }
  });
</script>

<!-- <h1>Workspace for database {data.name}</h1> -->
{#if loaded}
  <Workspace db={data} PouchDB={PouchDBState} uiComponents={customUIPages} />
{/if}

<!-- {JSON.stringify(data,null,2)} -->
