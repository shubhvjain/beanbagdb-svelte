<script>
  let {BBDB,page_bbdb_action} = $props()

  import SearchQuery from "$lib/core/SearchQuery.svelte";
  import SearchDocResults from "$lib/core/SearchDocResults.svelte";

  let resultsLoaded = $state(false)
  let results = $state([])
  async function handSearch(data){
    resultsLoaded = false
    console.log(data)
    let search = await BBDB.search({selector: data.json})
    results = search.docs
    resultsLoaded = true
  }
  async function handleSearchBBDBActions(data){
    if(page_bbdb_action){
      page_bbdb_action(data)
    }else{
      console.log(data)
    } 
  }
</script>

<SearchQuery {BBDB} on_submit={handSearch} />
{#if resultsLoaded}
  <SearchDocResults docs={results} bbdb_action={handleSearchBBDBActions}/>
{/if}