<script>
  import { onMount } from "svelte";

  import TagsEditor from "../utils/TagsEditor.svelte";
  import LinkEditor from "../utils/LinkEditor.svelte";
  import { emit_bbdb_event } from "../bbdb_actions.js";

  let { BBDB, id, bbdb_action } = $props();
  let loaded = $state(false);
  let edit = $state(false);
  let full_doc = $state({});
  onMount(async () => {
    console.log(id);

    try {
      //console.log(BBDB);
      let doc = await BBDB.read({ _id: id });
      console.log(doc);
      full_doc = doc.doc;
      loaded = true;
      edit = true;
    } catch (error) {
      console.log(error);
      loaded = false;
    }
  });
  const emit_update = () => {
    bbdb_action(
      emit_bbdb_event("metadata_updated", {
        id: id,
        schema: full_doc.schema,
        meta: full_doc.meta,
      })
    );
  };

  const edit_update_meta_action_handler = async (data) => {
    console.log(data);
    if (data.name == "edit_partial_meta") {
      try {
        console.log(data.data.update);
        let update1 = await BBDB.update({
          criteria: { _id: id },
          updates: data.data.update,
          rev_id: full_doc._rev,
        });
        console.log(update1);
        emit_update();
        return { update: true, error: null };
      } catch (error) {
        return { update: false, error: error };
      }
    }
  };

  const update_title = async () => {
    try {
      if (full_doc.meta.title.length == 0) {
        throw new Error("Title cannot be blank");
      }
      let update1 = await BBDB.update({
        criteria: { _id: id },
        updates: { data: {}, meta: { title: full_doc.meta.title } },
        rev_id: full_doc._rev,
      });
      console.log(update1);
      emit_update();
      return { update: true, error: null };
    } catch (error) {
      console.log(error);
      return { update: false, error: error };
    }
  };
</script>

{#if loaded}
  {#if edit}
    <div class="container-fluid">
      <div class="card1">
        <div class="card-body1">
          <div class="row">
            <div class="col-lg-9">
              <input
                type="text"
                bind:value={full_doc.meta.title}
                class="form-control form-control-sm1"
                id="inputTitle"
              />
            </div>
            <div class="col-lg-2">
              <button
                class="btn btn-primary"
                onclick={() => {
                  update_title();
                }}
              >
                Update</button
              >
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12 ps-3 pt-2">
              <LinkEditor
                bbdb_action={edit_update_meta_action_handler}
                bind:link={full_doc.meta.link}
                show_suggestion={false}
              />
            </div>
            <div class="col-lg-12 p-1">
              <TagsEditor
                bbdb_action={edit_update_meta_action_handler}
                link={full_doc.meta.link}
                tags={full_doc.meta.tags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    {JSON.stringify(data.meta, null, 2)}
  {/if}
{:else}
  Cannot be loaded or still loading
{/if}
