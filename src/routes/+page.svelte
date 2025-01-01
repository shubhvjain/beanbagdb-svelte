<script>
  import DBManager from "$lib/ui/DBManager.svelte";
  let temp = {}
</script>
<div class="container">
  <nav class="navbar navbar-light bg-light mb-2">
    <span class="navbar-brand mb-0 h1">BBDB</span>
  </nav>
  <!-- {JSON.stringify(temp,null,2)} -->
  <DBManager bbdb_action={(details)=>{
    temp = details
    console.log(details)
    }} 
    
    on_link_click = {
      (data)=>{
        if(data.page=="workspace"){
          window.open(`ws/${data.db_name}`)
        }
      
      }
    }
  />
</div>

