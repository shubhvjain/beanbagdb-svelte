Template for settings/pages:

```svelte
<script>
  import "$lib/default.style.css";
  import { onMount } from "svelte";
  import { emit } from "$lib/bbdb_actions.js";
  let { bbdb_action } = $props();

  const test = () => {
    console.log("hello");
    let data = emit("ping", { message: "Hello World" });
    console.log(data);
    bbdb_action(data);
  };
</script>  

<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12">
      <h3>Heading</h3>
      <p>Intro</p>
        ....
    </div>
  </div>
</div>
```


Page/setting components emit the common `bbdb_action` event. This event can be  handled by the UI components in different ways. 
It always returns a JSON with 2 main keys : `name` (name of the action) and `data` (data required to perform that action)

Eg usage in UI : 

```svelte
<script>
  import DBManager from "$lib/settings/DBManager.svelte";
  let temp = {}
</script>
<div class="container">
  {JSON.stringify(temp,null,2)} 
  <DBManager bbdb_action={(details)=>{
    temp = details
    console.log(details)
  }} />
</div>

```

The module `bbdb_actions.js` can be used to create these events in the page components




## utils or core components
no access to DB instance 
only gets data 
displays/modifies data
can return updated data to parent component 





