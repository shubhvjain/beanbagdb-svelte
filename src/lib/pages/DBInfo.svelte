<script>
  import "$lib/default.style.css";
  import { onMount } from "svelte";
  import { emit_event } from "$lib/bbdb_actions.js";
  import LogViewer from "$lib/utils/LogViewer.svelte";
  let { bbdb_action, BBDB } = $props();
  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";
  const test = () => {
    console.log("hello");
    let data = emit_event("ping", { message: "Hello World" });
    console.log(data);
    bbdb_action(data);
  };
  let data = $state({});
  let loaded = $state(false);
  let labels = {
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
  };
  onMount(async () => {
    let dt = await BBDB.plugins["txtcmd"].parse_and_run("page/info");
    data = dt["result"];
    console.log(data);
    loaded = true;
  });
</script>

{#if loaded}
  <div class="container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <h3>Database Info</h3>
        <ObjectViewer title="Metadata" data={data.meta}  labels={labels}/>
        <LogViewer logs={data["logs"]} />
      </div>
    </div>
  </div>
{/if}
