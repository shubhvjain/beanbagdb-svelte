export const emit = (name="ping",data={})=>{ 
  return {name,data}
}


export const open = (link)=>{ 
  return emit("open_link",{"link":link})
}
