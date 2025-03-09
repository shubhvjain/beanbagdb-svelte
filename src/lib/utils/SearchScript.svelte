<script>
  import { onMount } from "svelte";

  let {BBDB, on_return_query} = $props()
  let search_scripts = $state([])
  let selected_script = $state()
  let search_input = $state("")
  let loaded = $state(false)
  let error = $state("")

  function executeScript(script,input) {
    try {
      // Evaluate the script
      const result = eval(`(() => {  let input = "${input}";  ${script} })()`);
      // Check if the result is an object
      if (typeof result === "object" && result !== null) {
        return result;
      } else {
        throw new Error("Script did not return an object");
      }
    } catch (error) {
      console.error("Error executing script:", error.message);
      //return null;
      throw error
    }
  }



  async function load_scripts(){
    try {
        let scr = await BBDB.search({"selector":{"schema":"system_script","data.type":"search_query"}})
        console.log(scr)
        search_scripts = scr.docs
        //''let run_cmd = await BBDB.plugins.txtcmd.parse_and_run("new");
        //  schemas = run_cmd.result;
        } catch (error) {
          console.log(error);
        }
  }

  async function  generate_query_from_script(){
    try {
      error=""
      let d = await BBDB.read({"_id":selected_script._id}) // to fetch the latest script doc
      let script = d.doc.data.script
      let result = executeScript(script,search_input)
      if(!result.query){
        error="The script does not return any query"
      }else{
        if(on_return_query){
        on_return_query(result.query)
      }
      }
      // console.log(result)
    } catch (error1) {
      console.log(error1)
      error  = error1.message
    }
  }

  onMount(async()=>{
    try {
      await load_scripts()
    loaded = true  
    } catch (error) {
      console.log(error)
    }
    
  })
</script>

{#if loaded} 
<select class="form-select p-1 m-1" name="scr" id="src1" onchange={(e) => {
  if(e){
    selected_script = search_scripts[e.target.value];
  }
}}>
  <option value="">Select a search script</option>
  {#each search_scripts as s,i }
    <option value={i}>{s.meta.title}</option>
  {/each}
</select>
{#if selected_script}
{#if selected_script.data.usage !=" "}

<p>{selected_script.data.usage}</p>
<input type="text" class="form-control p-1 m-1" bind:value={search_input} placeholder="Search Input" />
{/if}
<button class="btn btn-sm btn-success m-2" onclick={generate_query_from_script}>Run</button> 
<br>
<span class="text-danger">  {error} </span>
{/if} 
{/if}


