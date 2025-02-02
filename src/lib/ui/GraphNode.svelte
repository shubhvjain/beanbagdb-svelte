<script lang="ts">
  import { Node } from 'svelvet';

function handleClick(e: CustomEvent) {
const { detail } = e;
detail.node.bgColor.set('red');
}

</script>

<Node  let:grabHandle let:selected on:nodeClicked="{handleClick}">
  <div use:grabHandle class:selected class="my-component">
    <span>Click Me</span>
  </div>



  
</Node>
