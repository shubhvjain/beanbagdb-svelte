
<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

  import Workspace from '$lib/ui/Workspace.svelte';

	import Sample from '$lib/pages/Sample.svelte';

let customUIPages = $state({
	sample:{
		component: Sample,
		title: 'Sample Page'
	}
})

</script>

<!-- <h1>Workspace for database {data.name}</h1> -->
<Workspace db={data} uiComponents={customUIPages} />

<!-- {JSON.stringify(data,null,2)} -->

