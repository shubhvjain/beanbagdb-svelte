
<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

  import Workspace from '$lib/ui/Workspace.svelte';




</script>

<!-- <h1>Workspace for database {data.name}</h1> -->
<Workspace db={data} />

<!-- {JSON.stringify(data,null,2)} -->

