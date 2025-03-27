<script>
  let { BBDB, custom_editors } = $props();
  import { onMount } from "svelte";

  import cytoscape from "cytoscape";
  import cytoscapeHtmlLabel from "cytoscape-node-html-label";
  cytoscape.use(edgehandles);
  cytoscapeHtmlLabel(cytoscape);

  import edgehandles from "cytoscape-edgehandles";

  import katex from "katex";
  import "katex/dist/katex.min.css";

  import NewDocument from "./NewDocument.svelte";
  import SearchBox1 from "$lib/core/SearchBox1.svelte";
  import ShortDoc from "$lib/core/ShortDoc.svelte";
  import EditEdge from "$lib/utils/EditEdge.svelte";
  import Doc from "$lib/core/Doc.svelte";

  let cy = $state(null);
  let eh = $state(null);
  let elements = $state([]);

  let selectedNode = $state(null);
  let selectedNodeId = $state(null);
  let selectedEdge = $state(null);
  let selectedEdgeId = $state(null);

  let icons = $state({});
  let infoBox = $state(null);

  let edge_editor = $state(false);
  let details_editor = $state(false);
  let detail_id = $state(null);

  let new_page_command = $state(null);
  let loaded = $state(false);

  let layoutJson = $state("");
  let errorMessage = $state("");

  let initialZoom = $state() //cy.zoom();
  let initialPan = $state() // cy.pan();
  let load_on_click = $state(true)
  const toggle_load_on_click = ()=>{
    load_on_click = !load_on_click
  }

  const layouts = [
    { name: "Grid", config: { name: "grid", fit: true, padding: 10 } },
    { name: "Circle", config: { name: "circle", fit: true } },
    { name: "Concentric", config: { name: "concentric", minNodeSpacing: 50 } },
    { name: "Breadthfirst", config: { "name": "breadthfirst", "directed": true,"padding": 5,"spacingFactor": 1.25} },
    { name: "Random", config: { name: "random" } },
  ];

  // Load layout settings into the textarea
  function loadLayout(layout) {
    layoutJson = JSON.stringify(layout.config, null, 2);
    errorMessage = "";
  }

  // Validate and apply layout
  function runLayout() {
    try {
      const parsedConfig = JSON.parse(layoutJson);
      cy.layout(parsedConfig).run();
      errorMessage = "";
    } catch (error) {
      errorMessage = "Invalid JSON format!";
    }
  }

  let excluded_schemas = [
    "schema",
    "system_log",
    "system_edge",
    "system_edge_constraint",
  ];

  // Function to encode raw SVG to Base64
  function encodeSVG(svgString) {
    return (
      "data:image/svg+xml;base64," +
      btoa(icons[svgString] ? icons[svgString] : icons["default"])
    );
  }

  function getSVG(svgString) {
    return icons[svgString] ? icons[svgString] : icons["default"]
  }
  function renderMathWithText(text) {
    if (text) {
      return text.replace(/\$(.*?)\$/g, (match, math) => {
        return katex.renderToString(math);
      });
    }
  }

  let load_icons = async () => {
    let dt = await BBDB.get({
      type: "schema_icons",
    });
    //console.log(dt)

    icons = dt;
    icons["default"] =
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-richtext" viewBox="0 0 16 16">
  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
  <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208M6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/>
</svg>`;
    icons["system_deleted_document"] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg>`

    //console.log(icons)
  };

  let load_graph = () => {
    // toggle_search_box()

    cy = cytoscape({
      container: document.getElementById("cy"),
      elements,
      wheelSensitivity: 0, // Disable zooming via trackpad scroll
      style: [
        {
          selector: "node",
          style: {
            shape: "ellipse", // Small circular node for the icon
            width: "20px", // Small enough to fit the icon
            height: "20px",
            //"background-color": "#ffffff",
            //'label': 'data(title)',  // Ensure label is set
            // Set the background image dynamically
            // "background-image": function (ele) {
            //   const schema = ele.data("schema");
            //   return encodeSVG(schema);
            // },
            //"background-repeat": "no-repeat",

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
            "font-size": "14px",
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
      ]
      //minZoom: 0.75, // Set the minimum zoom level
      //maxZoom: 3, // Optionally set a maximum zoom level
    });

   
    // Custom event listener to pan instead of zoom
    cy.container().addEventListener('wheel', function(event) {
      event.preventDefault(); // Prevent default zoom behavior
      const deltaX = event.deltaX; // Get horizontal scroll amount
      const deltaY = event.deltaY; // Get vertical scroll amount
      cy.panBy({ x: deltaX, y: deltaY }); // Move graph accordingly
    });

    //initialZoom = cy.zoom();
    //initialPan = cy.pan();

    cy.ready(storeInitialView);



    // Handle node double-click
    cy.on("dblclick", "node", function (evt) {
      const node = evt.target;
      const name = node.data("name");
      const type = node.data("type");

      // Update the floating box content
      // infoBox.innerHTML = `<strong>${name}</strong><br>Type: ${type}`;
      // if user already viewing doc , no need to show quick doc
      if (current_card == "view") return;
      // Show the box
      infoBox.style.display = "none";
      selectedNode = null;
      selectedNodeId = null;
      selectedEdge = null;
      selectedEdgeId = null;

      selectedNode = node;
      selectedNodeId = node.id();
      infoBox.style.display = "block";
    });

    cy.on("dblclick", "edge", function (evt) {
      const edge = evt.target;
      // const name = node.data("name");
      // const type = node.data("type");

      console.log(edge);
      // // Show the box
      infoBox.style.display = "none";
      selectedNode = null;
      selectedNodeId = null;
      selectedEdge = null;
      selectedEdgeId = null;

      console.log(edge.data("edge_id"));
      selectedEdgeId = edge.data("edge_id");
      selectedEdge = edge;
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
        selectedEdge = null;
        selectedEdgeId = null;
      }
    });

    // cy.nodeHtmlLabel([
    //   {
    //     query: "node", // cytoscape query selector
    //     halign: "center", // title vertical position. Can be 'left',''center, 'right'
    //     valign: "top", // title vertical position. Can be 'top',''center, 'bottom'
    //     halignBox: "center", // title vertical position. Can be 'left',''center, 'right'
    //     valignBox: "top", // title relative box vertical position. Can be 'top',''center, 'bottom'
    //     cssClass: "node_div", // any classes will be as attribute of <div> container for every title
    //     tpl: function (data) {
    //       return `<div class="node-label math-label" style="max-width:200px"">${renderMathWithText(data.title)}</div>`;
    //     },
    //   },
    // ]);

    cy.nodeHtmlLabel([
      {
        query: 'node', // Applies to all nodes
        halign: 'center', // Horizontal alignment
        valign: 'bottom', // Vertical alignment
        valignBox: 'bottom',
        tpl: function (data) {
          const schema_icon = getSVG(data.schema); 

          return `
            <div style="
              display: flex;
              align-items: center;
              pointer-events: none;
              background: #424649;
              border-radius: 8px;
              padding: 8px;
              box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
              max-width: 250px;
              white-space: normal;
              word-wrap: break-word;
              font-size: 15px;
            ">
              <div style="width: 25px; height: 25px; margin-right: 10px;">${schema_icon}</div>
              <span>${renderMathWithText(data.title)}</span>
            </div>
          `;
        }
      }
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
      try {

        // Check if an edge already exists
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
          console.log("Duplicate or reversed edge detected! Removing it.");
          addedEdge.remove();
          return;
        }

        // Temporarily assign a placeholder label to prevent warnings
        addedEdge.data({ edge_name: "loading..." });

        // Simulating an API call to create a new edge in the database
        let data1 = await createNewEdge(
          sourceNode.id(),
          targetNode.id(),
          "related_to"
        );
        console.log("New Edge Data:", data1._id);
        if (addedEdge && data1 && data1._id) {
          addedEdge.data({
            edge_name: "related_to",
            edge_id: data1._id,
          });
          console.log("Edge updated:", addedEdge.data());
        } else {
          console.error("Failed to update edge, removing it.");
          addedEdge.remove();
        }
      } catch (error) {
        console.error("Error creating edge:", error);
        addedEdge.remove();
      }
    });

    cy.on("tapselect", "node", (event) => {
      const selectedNode = event.target;
      detail_id = null;
      setTimeout(() => {
        load_selected_node(selectedNode.data("id"), selectedNode.data("link"),selectedNode);
      }, 250);
    });
  };

  async function load_selected_node(id, link,current_node=null) {
    if (current_card == "view") {
      console.log("gonna show the doc now");
      //console.log(selectedNode.data("id"));
      detail_id = id;
      
    } else {
      detail_id = null;
    }

    if(load_on_click){
      loadNode([link],current_node);
    }
  }

  async function createNewEdge(source, target, label) {
    try {
      let edge = await BBDB.create({
        schema: "system_edge",
        data: {
          node1: { _id: source },
          node2: { _id: target },
          edge_name: label,
        },
      });
      return edge;
    } catch (error) {
      console.log(error);
    }
  }

  onMount(async () => {
    await load_icons();
    new_page_command = await BBDB.apps["txtcmd"].parse("new");
    setTimeout(() => {
      load_graph();
      loaded = true;
    }, 100);
  });

  async function load_neighbor_subgraph(nodes) {
    console.log(nodes);
    let graph = await BBDB.apps.graph.find_neighbors(nodes);
    return graph;
  }

  async function loadNode(nodes,currentNode=null) {
    //console.log(nodes);
    let load_nodes = await load_neighbor_subgraph(nodes);
    //console.log(load_nodes);
    let added = 0;
    let to_add = [];
    
    for (let index = 0; index < load_nodes.length; index++) {
      const element = load_nodes[index];
      try {
        if (element.group == "nodes") {
          let schema_check = excluded_schemas.find((e) => {
            return e == element.data.schema;
          });
          //console.log(schema_check)
          if (schema_check) {
            continue;
          }
          let node = cy.getElementById(element.data.id);

            if (node.nonempty()) {
                console.log('Node exists:', node);
            } else {
                console.log('Node does not exist.');
                to_add.push(element);
                added++;
            }    
        }
        if (element.group == "edges") {
          let edgeExists = cy.edges().some(edge => edge.data('edge_id') === element.data.edge_id);

          if (!edgeExists) {
            to_add.push(element);
            added++;
          }else{
            continue;
          }
        }
        //cy.add();
      } catch (error) {
        console.log(error);
      }
    }
    console.log(added)
    console.log(to_add)
    if (added > 0) {
      let newNodes = cy.add(to_add);
      // console.log(newNodes);

      let currentZoom = cy.zoom();
      let currentPan = cy.pan();
      run_layout()
      // Run layout first
      cy.zoom(currentZoom);
      //cy.pan(currentPan);

      setTimeout(() => {
        cy.zoom(currentZoom); // Restore zoom level
        if(currentNode){
          cy.center(currentNode); // Move view to keep the clicked node in focus
        }
        
    }, 50);
    }
  }

  function run_layout(){

    let layout = cy.layout({
        name: "breadthfirst",
        nodeDimensionsIncludeLabels:true,
        fit: false,
        directed: true,
        avoidOverlap: true, 
       "padding": 10,
       "spacingFactor": 3,
       depthSort: function(a, b){ 
        //return a.data('level_weight') - b.data('level_weight') 
            // Get the incoming edge for each node (there should be at most one in a simple directed graph)
          let edgeA = a.incomers('edge')[0]; // Get the first incoming edge (if any)
          let edgeB = b.incomers('edge')[0]; 

          // Extract level_weight from the edge, defaulting to 1 if no edge exists
          let weightA = edgeA ? edgeA.data('level_weight') || 1 : 1;
          let weightB = edgeB ? edgeB.data('level_weight') || 1 : 1;

          return weightA - weightB;
        }
      });

      

      layout.run();

      
      // Ensure animation happens *after* layout is applied
      // setTimeout(() => {
      //   let lastNode = newNodes.last(); // Get the last added node safely
      //   cy.animate({
      //     center: { eles: lastNode },
      //     zoom: 0.75, // Adjust zoom level as needed
      //     duration: 200, // Optional: Smooth transition
      //   });
      // }, 200); // Give time for layout to finish
  }

  function removeSelected() {
    cy.$(":selected").remove();
  }

  async function handle_bbdb_action(option) {
    console.log(option);
    if (option.name == "metadata_updated") {
      console.log(option);
      let node = cy.getElementById(option.data.id);
      if (node) {
        node.data({ ...option.data.meta, id: option.data.id });
        console.log("updating");
      }
    }
    else if (option.name == "doc_deleted") {
      console.log(option);
      let node = cy.getElementById(option.data.id);
      if (node) {
        node.remove();
        console.log("node deleted");
      }
    }  
    
    else if (option.name == "textcmd") {
      console.log(option.data);
      // load_node_by_link(option.data.links)
      let cms = await BBDB.apps.txtcmd.parse(option.data.text);
      console.log(cms);
      if (cms.valid) {
        if (cms.name == "open") {
          loadNode([cms.criteria.link]);
        }
      }
    } else if (option.name == "edge_updated") {
      let edge = cy.getElementById(option.data.id);
      if (edge) {
        edge.data(option.data);
        console.log("updating");
      }
    } else if (option.name == "edge_deleted") {
      let edge = cy.edges().filter(edge => edge.data("edge_id") === option.data.id);

      if (edge.length > 0) {
        console.log("Edge found:", edge.data());
        edge.remove();
        console.log("delete");
        
      } else {
        console.log("Edge not found.");
      }

      // let edge =  cy.$(`edge[edge_id = "${option.data.id}]`) //cy.getElementById(option.data.id);
      // if (edge) {
      //   edge.remove();
      //   console.log("delete");
      // }
    } else if (option.name == "new_document_created") {
      loadNode([option.data.link]);
    } else if (option.name == "load_this_node") {
      loadNode([option.data.link]);
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

  function reset_view() {
    cy.elements().remove();
  }


  function reset_to_home() {
    cy.zoom(initialZoom);  // Reset zoom level
    cy.pan(initialPan);    // Reset position
  }

  function zoom_in(){
    cy.zoom(cy.zoom() * 1.2); // Increase zoom by 20%
  }
  function zoom_out(){
    cy.zoom(cy.zoom() * 0.8); // Decrease zoom by 20%
  }

  function storeInitialView() {
    cy.fit(); // Ensures the entire graph is visible
    initialZoom = cy.zoom();
    initialPan = cy.pan();
  }


  let current_card = $state("search");
  const change_card = (new_card) => {
    current_card = new_card;
  };
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-3 p-0">
      <div class="card p-0 m-0" id="sidebar">
        <div class="card-body" style="overflow: auto;">
          <nav>
            <div
              class="nav justify-content-center nav-underline border-bottom"
              id="nav-tab"
              role="tablist"
            >
              <button
                onclick={() => change_card("search")}
                class="nav-link active"
                id="nav-card1"
                data-bs-toggle="tab"
                data-bs-target="#card1"
                type="button"
                role="tab"
                aria-controls="card1"
                aria-selected="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  class="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
                  />
                </svg>
                Search</button
              >
              <button
                onclick={() => change_card("new")}
                class="nav-link"
                id="nav-card2"
                data-bs-toggle="tab"
                data-bs-target="#card2"
                type="button"
                role="tab"
                aria-controls="card2"
                aria-selected="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
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

                New</button
              >
              <button
                onclick={() => change_card("view")}
                class="nav-link"
                id="nav-card3"
                data-bs-toggle="tab"
                data-bs-target="#card3"
                type="button"
                role="tab"
                aria-controls="card3"
                aria-selected="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  class="bi bi-binoculars-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4.5 1A1.5 1.5 0 0 0 3 2.5V3h4v-.5A1.5 1.5 0 0 0 5.5 1zM7 4v1h2V4h4v.882a.5.5 0 0 0 .276.447l.895.447A1.5 1.5 0 0 1 15 7.118V13H9v-1.5a.5.5 0 0 1 .146-.354l.854-.853V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v.793l.854.853A.5.5 0 0 1 7 11.5V13H1V7.118a1.5 1.5 0 0 1 .83-1.342l.894-.447A.5.5 0 0 0 3 4.882V4zM1 14v.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5V14zm8 0v.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V14zm4-11H9v-.5A1.5 1.5 0 0 1 10.5 1h1A1.5 1.5 0 0 1 13 2.5z"
                  />
                </svg> View</button
              >
              <button
                onclick={() => change_card("setting")}
                class="nav-link"
                id="nav-card4"
                data-bs-toggle="tab"
                data-bs-target="#card4"
                type="button"
                role="tab"
                aria-controls="card4"
                aria-selected="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  class="bi bi-sliders2"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5M12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8m9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5m1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"
                  />
                </svg> Settings</button
              >
            </div>
          </nav>
          <div class="tab-content pt-1" id="nav-tabContent">
            <div
              class="tab-pane fade show active"
              id="card1"
              role="tabpanel"
              aria-labelledby="nav-home-tab"
              tabindex="0"
            >
              <!-- <p
                class="text-body-secondary fw-lighter fst-italic text-wrap text-center"
              >
                Search and show nodes and relations in the current map view
              </p> -->

              <SearchBox1
                {BBDB}
                max_selection={20}
                bbdb_action={handle_bbdb_action}
                search_query=""
              />
            </div>
            <div
              class="tab-pane fade"
              id="card2"
              role="tabpanel"
              aria-labelledby="nav-profile-tab"
              tabindex="0"
            >
              <!-- <p
                class="text-body-secondary fw-lighter fst-italic text-wrap text-center"
              >
                Create a new node
              </p> -->

              <NewDocument
                show_history={false}
                {custom_editors}
                {BBDB}
                {excluded_schemas}
                page_bbdb_action={handle_bbdb_action}
              />
            </div>
            <div
              class="tab-pane fade"
              id="card3"
              role="tabpanel"
              aria-labelledby="nav-contact-tab"
              tabindex="0"
            >
            
             
              <div class="container-fluid">
                <div class="row">
                  <div class="col-lg-12 ">
                    {#if detail_id}
                      <Doc
                        {BBDB}
                        {custom_editors}
                        doc_key={{ _id: detail_id }}
                        bbdb_action={handle_bbdb_action}
                      />

                      {:else}
                      <h5 class="p-1 m-2 mb-1 border-bottom">View Document</h5>
                      <p
                      class="text-body-secondary fw-lighter fst-italic text-wrap text-center"
                    >
                      Select a node and view it in detail
                    </p>

                    {/if}
                  </div>
                </div>
              </div>
            </div>
            <div
              class="tab-pane fade"
              id="card4"
              role="tabpanel"
              aria-labelledby="nav-contact-tab"
              tabindex="0"
            >
              <p
                class="text-body-secondary fw-lighter fst-italic text-wrap text-center"
              >
                Modify the settings of the map view
              </p>
              <h5 class="p-1 m-2 mb-1 border-bottom">Change layout</h5>

              <label class="mt-3" for="sdaa"
                >Layout Settings (Editable JSON):</label
              >
              <textarea
                id="sdaa"
                class="form-control"
                rows="5"
                bind:value={layoutJson}
              ></textarea>
              <!-- Error Message -->
              {#if errorMessage}
                <div class="alert alert-danger mt-2">{errorMessage}</div>
              {/if}
              <!-- Buttons for layouts -->
              <div class="mt-2">
                {#each layouts as layout}
                  <button
                    class="btn btn-sm btn-secondary m-1"
                    onclick={() => loadLayout(layout)}
                  >
                    {layout.name}
                  </button>
                {/each}
              </div>
              <!-- Run Layout Button -->
              <button class="btn btn-success mt-2" onclick={runLayout}
                >Run</button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-9 p-0">
      <div class="card p-0 m-0">
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
            {#if selectedEdge}
              <div class="row">
                <div class="col-lg-12">
                  <h6>Edit edge</h6>
                  <EditEdge
                    {BBDB}
                    edge_id={selectedEdgeId}
                    bbdb_action={handle_bbdb_action}
                  />
                </div>
              </div>
            {/if}
          </div>

          <div id="controlBox">
            <button
              aria-label="input"
              title="To toggle edge creation mode"
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
            title="To load neighbors on node click "
            onclick={()=>toggle_load_on_click()}
            class="btn btn-sm {load_on_click ? 'btn-success' : 'btn-danger'}"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-node-plus-fill" viewBox="0 0 16 16">
            <path d="M11 13a5 5 0 1 0-4.975-5.5H4A1.5 1.5 0 0 0 2.5 6h-1A1.5 1.5 0 0 0 0 7.5v1A1.5 1.5 0 0 0 1.5 10h1A1.5 1.5 0 0 0 4 8.5h2.025A5 5 0 0 0 11 13m.5-7.5v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2a.5.5 0 0 1 1 0"/>
          </svg>
          </button>

            <button
              aria-label="input"
              title="To go back to the current view "
              onclick={reset_to_home}
              class="btn btn-sm btn-dark"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
            </svg>
            </button>

            <button
              aria-label="input"
              title="To go back to the current view "
              onclick={zoom_in}
              class="btn btn-sm btn-dark"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
            </svg>
            </button>

            <button
              aria-label="input"
              title="To go back to the current view "
              onclick={zoom_out}
              class="btn btn-sm btn-dark"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
            </svg>
            </button>

            <button
              aria-label="input"
              title="To layout current view "
              onclick={run_layout}
              class="btn btn-sm btn-dark"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-2-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 5 7h2.5V6A1.5 1.5 0 0 1 6 4.5zm-3 8A1.5 1.5 0 0 1 4.5 10h1A1.5 1.5 0 0 1 7 11.5v1A1.5 1.5 0 0 1 5.5 14h-1A1.5 1.5 0 0 1 3 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 12.5z"/>
            </svg>
            </button>
            <button
            aria-label="input"
            title="To reset current view "
            onclick={reset_view}
            class="btn btn-sm btn-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-trash3"
              viewBox="0 0 16 16"
            >
              <path
                d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"
              />
            </svg>
          </button>
          </div>
          <div id="cy"></div>
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
  #sidebar {
    height: 88vh;
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
</style>
