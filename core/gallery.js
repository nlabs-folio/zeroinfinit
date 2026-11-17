export async function getGallery() {

    const response = await fetch("./nodes/index.json");

    if (!response.ok) {
        throw new Error("No s'ha pogut carregar la galeria");
    }

    return await response.json();

}