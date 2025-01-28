<script>
  import { Node, Svelvet, Minimap, Controls } from 'svelvet';
  let { page_bbdb_action, BBDB, page,custom_editors } = $props();

</script>
Hi
<Svelvet id="my-canvas" width="{500}" height="{500}" TD minimap controls locked>
  <Node />
  <Node id="alpha" bgColor="red" label="Default Node" />
</Svelvet>
