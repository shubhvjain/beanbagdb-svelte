<script>
  let {link  = $bindable() ,bbdb_action} = $props()
  import {emit_bbdb_event} from "$lib/bbdb_actions.js"

  // Props

  // State management
  let isEditing = $state(false);
  let tempLink = $state(link);
  let updateStatus = $state("");

  // Handlers
  const startEditing = () => {
    isEditing = true;
    tempLink = link;
    updateStatus = "";
  };

  const saveLink = async () => {
    updateStatus = "Updating link..."
    try {
      let resp =  await bbdb_action(emit_bbdb_event("edit_partial_meta",{link:link,update:{data:{},meta:{link:tempLink}}}))
    if (resp.update){
      updateStatus = "Updated"
      link = tempLink
      isEditing = false
    }else{
      updateStatus = resp.error.message
      isEditing = true
    }      
    } catch (error) {
      updateStatus = error.message
      isEditing = true
    }

  };

  const cancelEditing = () => {
    isEditing = false;
    updateStatus = "";
  };

  const randomIdGenerators = [
    { name: "Hex ID", generate: () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') },
   // { name: "Base64 ID", generate: () => btoa(Math.random().toString()) },
    // { name: "Timestamp ID", generate: () => Date.now().toString() },
    { name: "Unix Timestamp", generate: () => Math.floor(Date.now() / 1000).toString() },
    { name: "UUID", generate: () => crypto.randomUUID() },
   // { name: "Alphanumeric ID", generate: () => Math.random().toString(36) },
  
  ];
  const addRandomIdToInput = (generate) => {
    tempLink = generate();
  };

</script>

<style>
  .link-editor {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status-message {
    margin-top: 10px;
    color: red;
    font-size: 0.9em;
  }

  .status-success {
    color: green;
  }
</style>

<div class="link-editor">
  {#if isEditing}
    <input
      type="text"
      class="form-control"
      bind:value={tempLink}
      placeholder="Enter link"
    />
    <button class="btn btn-success btn-sm" onclick={saveLink}>Save</button>
    <button class="btn btn-secondary btn-sm" onclick={cancelEditing}>Cancel</button>
    
    <div class="random-id-buttons">
      {#each randomIdGenerators as { name, generate }}
        <button class="btn btn-outline-primary btn-sm btn-random-id m-1" onclick={() => addRandomIdToInput(generate)}>
          {name}
        </button>
      {/each}
    </div>
  {:else}
    <a href="" class="text-primary">{link}</a>
    <button class="btn btn-link btn-sm" onclick={startEditing} aria-label="Link edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
      </svg>
    </button>
  {/if}
</div>

{#if updateStatus}
 
    {updateStatus}
  
{/if}
