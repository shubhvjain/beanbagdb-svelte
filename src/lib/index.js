
import './ui/workspace.css';
import "./default.style.css"


// Reexport your entry components here
// Components from core
export { default as Doc } from './core/Doc.svelte';
export { default as SearchDocResults } from './core/SearchDocResults.svelte';
export { default as SearchQuery } from './core/SearchQuery.svelte';
export { default as ShortDoc } from './core/ShortDoc.svelte';

// Components from db
// No Svelte components to export from db

// Components from pages
export { default as DBPage } from './pages/DBPage.svelte';
export { default as DBPlugins } from './pages/DBPlugins.svelte';
export { default as DBSearch } from './pages/DBSearch.svelte';
export { default as Document } from './pages/Document.svelte';
export { default as Help } from './pages/Help.svelte';
export { default as NewDocument } from './pages/NewDocument.svelte';
export {default as GraphView} from "./pages/GraphView.svelte"
export { default as Sample } from './pages/Sample.svelte';

// Components from ui
export { default as DBManager } from './ui/DBManager.svelte';
export { default as WorkSpaceErrorPage } from './ui/WorkSpaceErrorPage.svelte';
export { default as WorkSpaceHome } from './ui/WorkSpaceHome.svelte';
export { default as Workspace } from './ui/Workspace.svelte';

// Components from utils
export { default as JSONEditor } from './utils/JSONEditor.svelte';
export { default as LinkEditor } from './utils/LinkEditor.svelte';
export { default as ObjectViewer } from './utils/ObjectViewer.svelte';
export { default as SchemaEditor } from './editors/SchemaEditor.svelte';
export { default as TableViewer } from './utils/TableViewer.svelte';
export { default as LogViewer } from './utils/LogViewer.svelte';
export { default as ObjectViewer2 } from './utils/ObjectViewer2.svelte';
export { default as SettingEditor } from './editors/SettingEditor.svelte';
export { default as TagsEditor } from './utils/TagsEditor.svelte';
export { default as SearchBox } from './core/SearchBox.svelte';
export { default as SearchBox1 } from './core/SearchBox1.svelte';
export { default as GraphEdgeEditor } from './editors/GraphEdgeEditor.svelte';
export { default as TextBlock} from './utils/TextBlock.svelte' 
export { default as TextPreview} from "./utils/TextPreview.svelte"
export {default as ScriptEditor} from "./editors/ScriptEditor.svelte"
export  {default as ExportData }from  "./pages/ExportData.svelte"
export  {default as Mermaid }from  "./utils/Mermaid.svelte"

// Scripts from db
export * as beanbagdbweb from './db/beanbagdbweb.js';
export * as pouchdbFind from './db/pouchdb.find.js';
export * as pouchdbMin from './db/pouchdb.min.js';
export * as textcommand from './db/textcommand.js';
export * as graphplugin from './db/graph.js';
export * as bbdb_actions from './bbdb_actions.js';