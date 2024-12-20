import { error } from "@sveltejs/kit";
import { get_database_details } from "$lib/bbdb_actions.js";

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  try {
    let data = get_database_details(params.dbname);
    return data
  } catch (error1) {
    console.log(error1)
    error(404, "Not found");
  }
}
