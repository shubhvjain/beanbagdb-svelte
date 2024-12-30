<script>
  import { onMount } from "svelte";
  import ObjectViewer2 from "$lib/utils/ObjectViewer2.svelte";
  import {
    copy_to_clipboard,
    format_timestamp,
    emit_bbdb_event,
    stringify_object_fields
  } from "$lib/bbdb_actions.js";
  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";  
  let { doc, schema, editable = false, edit_mode = "internal" } = $props();
  let loaded = $state(false);
  let mode = $state("view");

  const edit_external = () => {
    console.log("External edit triggered with data:", data);
    // Implement external edit logic here
  };

  const edit_internal = () => {
    mode = "edit";
  };

  const save_changes = (updatedData) => {
    console.log("Saving changes:", updatedData);
    doc = updatedData; // Update the data
    mode = "view"; // Return to view mode
  };

  const labels = {
    key_schema1: {
      name: { label: "Schema Name", help: "Name of the schema." },
      version: {
        label: "Version",
        help: "Type of backend database used.",
      },
      description: {
        label: "Database Version",
        help: "Version of the database schema.",
      },
      title: {
        label: "Code Version",
        help: "Version of the application code.",
      },
    },
  };

  const system_docs = [
    "system_key",
    "system_log",
    "system_setting",
    "system_edge_constraint",
    "system_edge",
    "system_media",
  ];
  const editable_system_docs = [
    "system_key",
    "system_setting",
    "system_edge_constraint",
    "system_edge",
    "system_media",
  ]

  onMount(() => {
    loaded = true;
  });
</script>

{#if loaded}
  {#if mode === "view"}
    {#if doc.schema == "system_log"}
    <ObjectViewer2 data={doc.data} schema={schema.schema}/>
    {/if}

    {#if doc.schema == "system_key"}
      Schema key
    {/if}

    {#if doc.schema == "system_setting"}
    <ObjectViewer2 data={doc.data} schema={schema.schema}/>
    {/if}

    {#if doc.schema == "system_edge_constraint"}
      Schema setting
    {/if}

    {#if doc.schema == "system_edge"}
      Schema setting
    {/if}

    {#if doc.schema == "system_media"}
      Schema setting
    {/if}

    {#if editable && editable_system_docs.includes(doc.schema)}
      <button
        class="btn btn-primary mt-3"
        onclick={() =>
          edit_mode === "external" ? edit_external() : edit_internal()}
      >
        Edit
      </button>
    {/if}
  {:else if mode === "edit"}
   
    <div class="container">
      <h4>Editing Document</h4>
    </div>
  {/if}
{:else}
  <!-- Loading Placeholder -->
  <div class="container text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p>Loading document...</p>
  </div>
{/if}
