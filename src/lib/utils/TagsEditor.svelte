<script>
  let {tags=[],link,bbdb_action} = $props()
  import {emit_bbdb_event} from "$lib/bbdb_actions.js"
  // Add a new tag
  const addTag = (newTag) => {
    newTag = newTag.trim().replace(/\s+/g, "_");
    if (newTag && !tags.includes(newTag)) {
      tags = [...tags, newTag];
      save_data()
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    tags = tags.filter(tag => tag !== tagToRemove);
    save_data()
  };

  let inputTag = $state(""); // To hold input for a new tag

  const save_data =  ()=>{
    bbdb_action(emit_bbdb_event("edit_partial_meta",{link:link,update:{data:{},meta:{tags:tags}}}))
    // todo :disable for 2 secs 
  }


</script>

<style>
  .tags-editor {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    /* border: 1px solid #ccc; */
    padding: 10px;
    border-radius: 5px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    background-color: #e0e0e0;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 14px;
  }

  .tag button {
    background: none;
    border: none;
    margin-left: 5px;
    cursor: pointer;
    color: #ff4d4d;
    font-weight: bold;
  }

  .tag-input {
    flex-grow: 1;
    min-width: 150px;
    border: none;
    outline: none;
    font-size: 14px;
  }
</style>

<div class="tags-editor">
  {#each tags as tag}
    <span class="tag text-secondary" ondblclick={() => inputTag = tag} aria-roledescription="To copy to text">
      {tag}
      <button onclick={() => removeTag(tag)}>x</button>
    </span>
  {/each}

  <input 
    class="form-control form-control-sm p-1 m-1" 
    type="text" 
    bind:value={inputTag} 
    onkeypress={(e) => {
      if (e.key === 'Enter') {
        addTag(inputTag);
        inputTag = ""; // Clear the input
      }
    }}
    placeholder="Add a tag..." />
</div>
