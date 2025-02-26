<script>
  import { onMount } from "svelte";

  export let data = {};
  export let schema = {};

  // Function to extract title or fallback to key
  const getTitle = (key) => {
    return  schema?.properties?.[key]?.title || key;
  }
</script>

<ul class="list-group list-group-flush">
  {#each Object.entries(data) as [key, value]}
    <li class="list-group-item">
      {#if Array.isArray(value)}
        <strong> <i>{getTitle(key)}:</i>  </strong>
        {value}
        {#each value as item}
          <span class="badge bg-primary m-1">{item}</span>
        {/each}


      {:else if typeof value=="object"}
        <strong> <i>{getTitle(key)}:</i>  </strong>
        <ul class="sub-list list-group mt-1">
          {#each Object.entries(value) as [subKey, subValue]}
            <li class="list-group-item">
              {#if Array.isArray(subValue)}

                  <div class="d-flex">
                    <div class="p-2">
                      <strong> <i>{getTitle(subKey)}:</i>  </strong> 
                    </div>
                    <div class="p-2 flex-grow-1">
                      {#each subValue as item}
                        <span class="p-1 m-1">{item}</span> <br>
                      {/each}
                    </div>
                  </div>

              {:else if typeof subValue === "object"}
                <strong> <i>{getTitle(subKey)}:</i>  </strong>

                <ul class="sub-list list-group mt-1">
                  {#each Object.entries(subValue) as [subsubKey, subsubValue]}
                  <li class="sub-list">
                    
                  
                  <strong>{subsubKey}:</strong>
                    
                      <ul class="sub-list">
                        {#each Object.entries(subsubValue) as [a,b] }
                        <li class="list-group-itemq">
                          <p class="m-1"><b><i> {a}</i></b> : <code>  {JSON.stringify(b,null,1)}  </code> </p> 
                        </li>
                        {/each}
                      </ul>
                      
                      
                    </li>
                  {/each}
                </ul>

             
              {:else}
                <div class="d-flex">
                  <div class="p-2">
                    <strong> <i>{getTitle(subKey)}:</i>  </strong>
                  </div>
                  <div class="p-2 flex-grow-1">
                    {subValue}
                  </div>
                </div>

              {/if}
            </li>
          {/each}
        </ul>



       
      {:else}
      <div class="d-flex">
        <div class="p-2">
          <strong> <i>{getTitle(key)}:</i>  </strong>
        </div>
        <div class="p-2 flex-grow-1">
          {value}
        </div>
      </div>
      {/if}
      
    </li>
  {/each}
</ul>

<style>
  .list-group-item {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }

  .badge {
    margin: 2px;
  }

  .sub-list {
    padding-left: 20px;
  }
</style>
