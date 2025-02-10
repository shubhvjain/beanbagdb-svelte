<script>
  let { BBDB } = $props();
  import { onMount } from "svelte";

  import cytoscape from "cytoscape";
  import cytoscapeHtmlLabel from "cytoscape-node-html-label";
  cytoscape.use(edgehandles);
  cytoscapeHtmlLabel(cytoscape);

  import edgehandles from "cytoscape-edgehandles";

  import katex from "katex";
  import "katex/dist/katex.min.css";

  import NewDocument from "./NewDocument.svelte";
  import SearchBox from "$lib/core/SearchBox.svelte";
  import ShortDoc from "$lib/core/ShortDoc.svelte";

  let cy = $state(null);
  let eh = $state(null);
  let elements = $state([]);
  let selectedNode = $state(null);
  let selectedNodeId = $state(null);
  let icons = $state({});
  let infoBox = $state(null);
  let loadBox = $state(null);
  let edge_editor = $state(false);
  let load_editor = $state(true);
  let newBox = $state(null);
  let newBox_editor = $state(false);
  let new_page_command = $state(null);
  let loaded = $state(false);

  // Function to encode raw SVG to Base64
  function encodeSVG(svgString) {
    return (
      "data:image/svg+xml;base64," +
      btoa(icons[svgString] ? icons[svgString] : icons["default"])
    );
  }
  function renderMathWithText(text) {
    if (text) {
      return text.replace(/\$(.*?)\$/g, (match, math) => {
        return katex.renderToString(math);
      });
    }
  }

  let load_icons = async () => {
    let dt = await BBDB.read({
      schema: "system_setting",
      data: { name: "graph_icons" },
    });
    icons = dt.doc.data.value;
    icons["default"] =
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-richtext" viewBox="0 0 16 16">
  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
  <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208M6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/>
</svg>`;
  };

  let load_graph = () => {
    cy = cytoscape({
      container: document.getElementById("cy"),
      elements,
      style: [
        {
          selector: "node",
          style: {
            shape: "ellipse", // Small circular node for the icon
            width: "25px", // Small enough to fit the icon
            height: "25px",
            "background-color": "#ffffff",

            // Set the background image dynamically
            "background-image": function (ele) {
              const schema = ele.data("schema");
              return encodeSVG(schema);
            },
            "background-repeat": "no-repeat",

            // Dynamic label (multiple fields combined)
            //'label': function(ele) {return `${ele.data('title')}`},
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#666",
            "target-arrow-color": "#666",
            label: "data(edge_name)",
            "font-size": "12px",
            "text-background-color": "#fff",
            "text-background-opacity": 1,
            "text-margin-y": -10,
          },
        },

        // some style for the extension

        {
          selector: ".eh-handle",
          style: {
            "background-color": "red",
            width: 12,
            height: 12,
            shape: "ellipse",
            "overlay-opacity": 0,
            "border-width": 12, // makes the handle easier to hit
            "border-opacity": 0,
          },
        },

        {
          selector: ".eh-hover",
          style: {
            "background-color": "red",
          },
        },

        {
          selector: ".eh-source",
          style: {
            "border-width": 2,
            "border-color": "red",
          },
        },

        {
          selector: ".eh-target",
          style: {
            "border-width": 2,
            "border-color": "red",
          },
        },

        {
          selector: ".eh-preview, .eh-ghost-edge",
          style: {
            "background-color": "red",
            "line-color": "red",
            "target-arrow-color": "red",
            "source-arrow-color": "red",
          },
        },

        {
          selector: ".eh-ghost-edge.eh-preview-active",
          style: {
            opacity: 0,
          },
        },
      ],
      layout: {
        name: "grid",
        rows: 1,
      },
      minZoom: 1, // Set the minimum zoom level
      maxZoom: 3, // Optionally set a maximum zoom level
    });

    // Handle node double-click
    cy.on("dblclick", "node", function (evt) {
      const node = evt.target;
      const name = node.data("name");
      const type = node.data("type");

      // Update the floating box content
      // infoBox.innerHTML = `<strong>${name}</strong><br>Type: ${type}`;

      // Show the box
      selectedNode = node;
      selectedNodeId = node.id();
      infoBox.style.display = "block";
    });

    // Enable edgehandles
    cy.on("tap", "node", function (evt) {
      eh.enable(); // Enable edgehandles after clicking a node
    });

    // Hide the box when clicking anywhere else
    cy.on("tap", function (event) {
      if (event.target === cy) {
        infoBox.style.display = "none";
        selectedNode = null;
        selectedNodeId = null;
      }
    });

    cy.nodeHtmlLabel([
      {
        query: "node", // cytoscape query selector
        halign: "center", // title vertical position. Can be 'left',''center, 'right'
        valign: "top", // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: "center", // title vertical position. Can be 'left',''center, 'right'
        valignBox: "top", // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: "", // any classes will be as attribute of <div> container for every title
        tpl: function (data) {
          return `<div class="node-label math-label" style="max-width:200px"">${renderMathWithText(data.title)}</div>`;
        },
      },
    ]);

    // the default values of each option are outlined below:
    let defaults = {
      handleSize: 10,
      edgeType: "flat",
      loopAllowed: false, // Prevent self-loops

      // canConnect: function (sourceNode, targetNode) {
      //   // whether an edge can be created between source and target
      //   return !sourceNode.same(targetNode); // e.g. disallow loops
      // },
      // edgeParams: function (sourceNode, targetNode) {
      //   // for edges between the specified source and target
      //   // return element object to be passed to cy.add() for edge
      //   return {};
      // },
      hoverDelay: 100, // time spent hovering over a target node before it is considered selected
      //snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
      //snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
      //snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      //noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
      //disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
    };

    eh = cy.edgehandles(defaults);
    cy.on("ehcomplete", async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;

      // Check if an edge already exists from source → target OR target → source
      let existingEdge = cy
        .edges()
        .filter(
          (edge) =>
            (edge.data("source") === sourceNode.id() &&
              edge.data("target") === targetNode.id()) ||
            (edge.data("source") === targetNode.id() &&
              edge.data("target") === sourceNode.id())
        );

      if (existingEdge.length > 1) {
        // If more than 1 edge exists (new one was added)
        console.log("Duplicate or reversed edge detected! Removing it.");
        addedEdge.remove(); // Remove duplicate or reversed edge
      } else {
        let edge = existingEdge[0];
        await createNewEdge(sourceNode.id(), targetNode.id(), "related_to");
        edge.data("edge_name", "related_to");
      }
    });
  };

  async function createNewEdge(source, target, label) {
    try {
      let edge = await BBDB.create({
        schema: "system_edge",
        data:{
          node1: { _id: source },
          node2: { _id: target },
          edge_name: label,
        }
      });
      console.log(edge)
    } catch (error) {
      console.log(error)
    }
  }

  onMount(async () => {
    await load_icons();
    new_page_command = await BBDB.plugins["txtcmd"].parse("new");
    setTimeout(() => {
      load_graph();
      loaded = true;
    }, 100);
  });

  const on_node_selected = (data) => {
    if (data) {
      //console.log(data);
      let ids  = []
      data.map(d=>{ids.push(d.link)})
      loadNode(ids);
      return { clear: true };
    } else {
      return { clear: false };
    }
  };

  async function load_neighbor_subgraph(nodes){
    console.log(nodes)
    let graph = await BBDB.plugins.graph.find_neighbors(nodes)
    return graph 
  }

  async function loadNode(nodes) {
    console.log(nodes)
    let  load_nodes = await load_neighbor_subgraph(nodes)
    console.log(load_nodes)
    load_nodes.map(itm=>{
      try {
        cy.add(itm);
      } catch (error) {
        console.log(error);
      }
    })
    cy.layout({ 
      name: "breadthfirst" , 
      padding: 30,
      directed :true,


    }).run();
  }


  function removeSelected() {
    cy.$(":selected").remove();
  }

  async function handle_bbdb_action(option) {
    if (option.name == "metadata_updated") {
      console.log(option);
      let node = cy.getElementById(option.data.id);
      if (node) {
        node.data({ ...option.data.meta, id: option.data.id });
        console.log("updating");
      }
    } else if (option.name == "textcmd") {
      console.log(option.data);
      // load_node_by_link(option.data.links)
      let cms = await BBDB.plugins.txtcmd.parse(option.data.text);
      console.log(cms);
      if (cms.valid) {
        if (cms.name == "open") {
          loadNode([cms.criteria.link])
        }
      }
    }
  }
  function toggle_edge_edit() {
    if (!edge_editor) {
      eh.enableDrawMode();
    } else {
      eh.disableDrawMode();
    }
    edge_editor = !edge_editor;
  }

  function toggle_search_box() {
    load_editor = !load_editor;
    loadBox.style.display = load_editor ? "block" : "none";
  }

  function toggle_new_box() {
    newBox_editor = !newBox_editor;
    newBox.style.display = newBox_editor ? "block" : "none";
  }

  function reset_view(){
    cy.elements().remove();
  }
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12">
      <div class="card p-1 m-1">
        <div class="card-body">
          <div id="infoBox" bind:this={infoBox}>
            {#if selectedNode}
              <div class="row">
                <div class="col-lg-12">
                  <h6>Edit nodes</h6>
                  <ShortDoc
                    {BBDB}
                    id={selectedNodeId}
                    bbdb_action={handle_bbdb_action}
                  />
                </div>
              </div>
            {/if}
          </div>
          <div id="controlBox">
            <button
              aria-label="input"
              onclick={toggle_edge_edit}
              class="btn btn-sm {edge_editor ? 'btn-danger' : 'btn-success'}"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-bezier"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M0 10.5A1.5 1.5 0 0 1 1.5 9h1A1.5 1.5 0 0 1 4 10.5v1A1.5 1.5 0 0 1 2.5 13h-1A1.5 1.5 0 0 1 0 11.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm10.5.5A1.5 1.5 0 0 1 13.5 9h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM6 4.5A1.5 1.5 0 0 1 7.5 3h1A1.5 1.5 0 0 1 10 4.5v1A1.5 1.5 0 0 1 8.5 7h-1A1.5 1.5 0 0 1 6 5.5zM7.5 4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"
                />
                <path
                  d="M6 4.5H1.866a1 1 0 1 0 0 1h2.668A6.52 6.52 0 0 0 1.814 9H2.5q.186 0 .358.043a5.52 5.52 0 0 1 3.185-3.185A1.5 1.5 0 0 1 6 5.5zm3.957 1.358A1.5 1.5 0 0 0 10 5.5v-1h4.134a1 1 0 1 1 0 1h-2.668a6.52 6.52 0 0 1 2.72 3.5H13.5q-.185 0-.358.043a5.52 5.52 0 0 0-3.185-3.185"
                />
              </svg>
            </button>

            <button
              aria-label="input"
              onclick={toggle_search_box}
              class="btn btn-sm btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
                />
              </svg>
            </button>
            <button
              aria-label="input"
              onclick={toggle_new_box}
              class="btn btn-sm btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-plus-circle"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                />
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
                />
              </svg>
            </button>

            <button
              aria-label="input"
              onclick={reset_view}
              class="btn btn-sm btn-primary"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
            </svg>
             
            </button>

            


          </div>
          <div id="cy"></div>
          <div id="loadBox" bind:this={loadBox}>
            <h5 class="p-1 m-2 mb-1 border-bottom">Load Documents</h5>
            <div class="row">
              <div class="col-lg-12 m-1">
                <SearchBox
                  {BBDB}
                  max_selection={10}
                  action_and_release={on_node_selected}
                  search_query="schema=object"
                  on_load_select_first={true}
                />
              </div>
            </div>
          </div>
          <div id="newBox" bind:this={newBox}>
            <h5 class="p-1 m-2 mb-1 border-bottom">New Document</h5>
            <div class="row">
              <div class="col-lg-12">
                <NewDocument {BBDB} page_bbdb_action={handle_bbdb_action} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  #cy {
    width: 100%;
    height: 85vh;
  }

  #infoBox {
    position: absolute;
    top: 10px;
    left: 10px;
    /* background: white; */
    padding: 10px;
    border: 2px solid #cccccc3d;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    display: none; /* Initially hidden */
    z-index: 1000; /* Ensure it stays above Cytoscape */
    background: #1008084f;
  }

  #controlBox {
    position: absolute;
    top: 10px;
    right: 10px;
    /* background: white; */
    padding: 2px;
    border: 1px solid #cccccc3d;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it stays above Cytoscape */
    background: #1008084f;
  }

  #loadBox {
    position: absolute;
    bottom: 10px;
    right: 10px;
    /* background: white; */
    padding: 2px;
    border: 1px solid #cccccc3d;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it stays above Cytoscape */
    max-width: 500px;
    background: #1008084f;
  }

  #newBox {
    position: absolute;
    bottom: 10px;
    left: 10px;
    /* background: white; */
    padding: 2px;
    border: 1px solid #cccccc3d;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it stays above Cytoscape */
    max-width: 500px;
    background: #1008084f;
  }

  .node-label {
    width: 200px;
  }
</style>
