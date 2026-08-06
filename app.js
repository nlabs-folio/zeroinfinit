import { getGallery } from "./core/gallery.js";
import { loadEntity } from "./core/loader.js";
import { startEntity } from "./core/runtime.js";


async function boot() {

    const gallery = await getGallery();

    console.log("ZERO INFINIT");
    console.log("Entitats disponibles:", gallery);


    const firstNode = gallery.nodes[0];

    const entity = await loadEntity(firstNode.entry);

    startEntity(entity);

}


boot();
