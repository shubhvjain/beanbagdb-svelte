<script>
  let {data=[],labels,bbdb_action} = $props();
  
  // Determine which columns to display
  const columns = Object.keys(labels).length > 0 ? Object.keys(labels) : (data[0] ? Object.keys(data[0]) : []);
  import {emit_bbdb_event} from "$lib/bbdb_actions.js"


  import { onMount } from 'svelte';

  onMount(() => {
  
  });

  function handleLinkClick(link) {
    if(bbdb_action){
      bbdb_action(emit_bbdb_event("textcmd",{text:`open/link/${link}`}))
    }else{
      console.log(link)
    }
    
  }
</script>

<style>
  .tooltip-inner {
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 0.5rem;
  }

  th {
    position: relative;
  }
</style>


<table class="table table-bordered table-hover">
  <thead class="thead-light">
    <tr>
      {#each columns as column}
        <th scope="col">
          {labels[column]?.title || column}
          {#if labels[column]?.info}
            <span
              class="d-inline-block"
              tabindex="0"
              data-bs-toggle="tooltip"
              title={labels[column].info}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
            </span>
          {/if}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if data.length > 0}
      {#each data as row}
        <tr>
          {#each columns as column}
            <td>
              {#if column === 'link'}
                <a href="#" onclick={() => handleLinkClick(row[column])}>{row[column]}</a>
              {:else}
                {row[column] || ''}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    {:else}
      <tr>
        <td colspan={columns.length} class="text-center">No data available</td>
      </tr>
    {/if}
  </tbody>
</table>
