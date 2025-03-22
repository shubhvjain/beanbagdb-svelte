<script>
  let {title,onclick} = $props()
  let confirming = $state(false);
  
  function confirm() {
    if(onclick){
      onclick()
      confirming = false;
    }
  }
</script>



{#if !confirming}
<button class="btn btn-sm btn-dark " onclick={() => confirming = true} class:hidden={confirming}>
  {title||"Delete"}
</button>
{/if}

{#if confirming}
  <button class="btn btn-danger btn-sm" onclick={confirm}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-all" viewBox="0 0 16 16">
      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"/>
      <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708"/>
    </svg>
  </button>
  <button  class="btn btn-dark btn-sm"  onclick={() => confirming = false}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
  </button>
{/if}
