export async function loadNode(id) {

    const response = await fetch("./nodes/index.json");

    if (!response.ok) {
        throw new Error("No s'ha pogut carregar l'índex de nodes");
    }

    const registry = await response.json();

    const node = registry.nodes.find(
        node => node.id === id
    );

    if (!node) {
        throw new Error(`Node no trobat: ${id}`);
    }

    const module = await import(`../${node.entry}`);

    return module;
}