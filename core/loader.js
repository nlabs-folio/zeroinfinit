export async function loadEntity(entry) {

    const module = await import(`../${entry}`);

    return module;

}