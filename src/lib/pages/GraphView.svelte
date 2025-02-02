<script>
  import { Node, Svelvet, Minimap, Controls } from 'svelvet';
  let { page_bbdb_action, BBDB, page,custom_editors } = $props();
  import GraphNode from '$lib/ui/GraphNode.svelte';
</script>

<div class="conteiner-fluid" style="height: 100vh;">
  <Svelvet id="my-canvas" theme="dark" TD minimap controls>
    <GraphNode/>
    <GraphNode/>
    <GraphNode/>
  </Svelvet>
</div>

