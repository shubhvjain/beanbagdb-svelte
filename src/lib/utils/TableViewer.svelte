<script>
  let {data,labels,bbdb_action} = $props();
  
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
              <i class="bi bi-info-circle"></i>
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
