async function graph_format_nodes(node_ids){
  let node_search = await this.search({selector:{_id:{ $in: node_ids  }}})
  let nodes = []
  node_search.docs.map(itm=>{
    nodes.push({ group: 'nodes', data:{id:itm._id,title:itm.meta.title, schema: itm.schema}})
  })
  return {nodes}
}

async function graph_format(options){

      let formats = {
          "json1": async (data)=>{
            let node_ids =  new Set()
            let edges =  []
            for (let index = 0; index < edges_found.length; index++) {
              const edge = edges_found[index];
              // format edge
              edges.push({source:edge.data.node1,target:edge.data.node2,relation:edge.data.edge_name,properties:{note:edge.data.note}})
              node_ids.add(edge.data.node1)
              node_ids.add(edge.data.node2)
            }
            let nodes = await this.graph_format_nodes([...node_ids])
          }
      }
      let {edges_found=[],format="json1"} = options
      if(formats[format]){
        let data = await formats[format](edges_found)
        return data
      }else{
        throw new ValidationError("Invalid graph format")
      }

}

async function graph_merge(graph1,graph2){
 let m_graph={
  nodes: Array.from(new Map([...graph1.nodes, ...graph2.nodes].map(node => [node.id, node])).values()),
  edges: Array.from(new Set([...graph1.edges, ...graph2.edges].map(edge => 
      `${edge.source}->${edge.target}:${edge.relation}`)))
      .map(edgeStr => {
          const [sourceTarget, relation] = edgeStr.split(":");
          const [source, target] = sourceTarget.split("->");
          return { source, target, relation };
      })
  }
  return m_graph
}

async function graph_query1(option){
  let bdb = this
  const queries = {
    // find_nodes_by_property: {
    //   description: "Find nodes that match a given property and value.",
    //   validation: (data) => {
    //       if (!data.property || typeof data.property !== "string") return "Invalid 'property'. Must be a string.";
    //       if (!data.value) return "Invalid 'value'. Must be defined.";
    //       return null;
    //   },
    //   run: async (data, db) => {
    //       // Search for nodes based on property
    //       const result = await db.find({ selector: { [data.property]: data.value } });
    //       return result.docs;
    //   }
    // },
    find_neighbors: {
        description: "Get 1-hop neighbors of a given node.",
        validation: (data) => {
            if (!data.node) return "Node is required";
            if (data.edge_name && typeof data.edge_name !== "string") return "Invalid 'edge_name'. Must be a string.";
            return null;
        },
        run: async (data,settings) => {
            // Fetch direct neighbors from CouchDB/PouchDB
            let node_search = await bdb.read(data.node)
            let query =  { schema:"system_edge", "data.node1": node_search.doc._id, "data.edge_name": data.edge_name || { $exists: true } }
            const result = await bdb.search({ selector:  query  });   
            const graph = await bdb.graph_format(result.docs)         
            return graph
        }
    },

    load_sub_graph : {
      description: "Given a search criteria, returns the subgraph of all nodes and edges related to these graphs",
      validation:(data)=>{
        if(!data){
          tho
        } 
      },

    }
    // find_all_reachable: {
    //     description: "Perform DFS to find all nodes reachable from the given node.",
    //     validation: (data) => {
    //         if (!data.node || typeof data.node !== "string") return "Invalid 'node'. Must be a string.";
    //         return null;
    //     },
    //     run: async (data, db) => {
    //         // DFS Traversal (placeholder)
    //         return await dfsTraversal(db, data.node, data.edge_name || "*");
    //     }
    // },  
    // find_edges_by_type: {
    //     description: "Retrieve all edges of a specific edge_name type.",
    //     validation: (data) => {
    //         if (!data.edge_name || typeof data.edge_name !== "string") return "Invalid 'edge_name'. Must be a string.";
    //         return null;
    //     },
    //     run: async (data, db) => {
    //         // Get edges of specific type
    //         const result = await db.find({ selector: { edge_name: data.edge_name } });
    //         return result.docs;
    //     }
    // },
    // count_neighbors: {
    //     description: "Count the number of direct neighbors of a node.",
    //     validation: (data) => {
    //         if (!data.node || typeof data.node !== "string") return "Invalid 'node'. Must be a string.";
    //         return null;
    //     },
    //     run: async (data, db) => {
    //         const result = await db.find({ selector: { node1: data.node } });
    //         return result.docs.length;
    //     }
    // },
    // count_reachable_nodes: {
    //      description: "Count all nodes reachable from a given node using DFS.",
    //     validation: (data) => {
    //         if (!data.node || typeof data.node !== "string") return "Invalid 'node'. Must be a string.";
    //         return null;
    //     },
    //     run: async (data, db) => {
    //         const reachableNodes = await dfsTraversal(db, data.node, "*");
    //         return reachableNodes.length;
    //     }
    // },
    // suggest_connections: {
    //     description: "Suggest new connections based on 2nd-degree neighbors.",
    //     validation: (data) => {
    //         if (!data.node || typeof data.node !== "string") return "Invalid 'node'. Must be a string.";
    //         return null;
    //     },
    //     run: async (data, db) => {
    //         const neighbors = await db.find({ selector: { node1: data.node } });
    //         let suggestions = new Set();
    //         for (const neighbor of neighbors.docs) {
    //             const secondDegree = await db.find({ selector: { node1: neighbor.node2 } });
    //             secondDegree.docs.forEach(doc => suggestions.add(doc.node2));
    //         }
    //         return [...suggestions].filter(n => n !== data.node); // Exclude self
    //     }
    // }
  };
  try {
    const { query, data, settings } = option;
    if (!queries[query]) return { error: "Unknown query type." };
    const validationError = queries[query].validation(data);
    if (validationError) return { error: validationError };
    let graph = await queries[query].run(data, settings);
    return {graph,error:null};
  } catch (error) {
    return {error}
  }
}


async function link_to_id(db,links){
  //console.log(links)
  if (!links || links.length == 0) {
    // console.log("ha kya")
    return [];
  }
  
  let ids = []
  let search = await db.search({
    selector: { "meta.link": { $in: links } },
  });
  //console.log(ids)
  search?.docs.map(d=>{ids.push(d._id)})
  return ids
}


const find_neighbors = async (db,links) => {
  //console.log(links)
  let nodes  = await link_to_id(db,links)
  //console.log(nodes)
  let data = await db.search({selector:{
    "schema":"system_edge",
    'data.node1':{"$in":nodes}
  }})
  //console.log(data)
  let _edges = []
  for (let index = 0; index < data?.docs.length; index++) {
    const element = data?.docs[index];
    _edges.push({"group":"edges",data:{id:element._id,edge_name:element.data.edge_name,source:element.data.node1,target:element.data.node2}})
    let find1 = nodes.find((itm)=>itm==element.data.node1)
    if(!find1){nodes.push(element.data.node1)}
    let find2 = nodes.find((itm)=>itm==element.data.node2)
    //console.log(find2)
    if(!find2){nodes.push(element.data.node2)}
    
  }
  let _nodes1 = []
  //console.log(nodes)
  let data1 = await db.search({selector:{
    '_id':{"$in":nodes}
  }})
  //console.log(data1)
  data1?.docs.map(itm=>{
    _nodes1.push({group:"nodes",data:{...itm.meta,id:itm._id,schema: itm.schema}})
  })

  return [..._nodes1,..._edges]
}





export const graph_query = {
  actions: {find_neighbors,link_to_id}
};