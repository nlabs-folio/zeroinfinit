
let frame = null;

export function start() {

  if (frame) return;

  const host =
    document.querySelector("[data-entity-host]") ||
    document.body;

  const entityFrame = document.createElement("iframe");

  entityFrame.title = "Integral";
  entityFrame.src = new URL(
    "./index.html",
    import.meta.url
  ).href;

  // Aïllament respecte del DOM del nucli.
  entityFrame.setAttribute("sandbox", "allow-scripts");
  entityFrame.setAttribute("allow", "autoplay");

  Object.assign(entityFrame.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    border: "0",
    margin: "0",
    padding: "0",
    display: "block",
    background: "#000000",
    zIndex: "9999"
  });

  // Assignar la referència abans d'inserir-lo.
  frame = entityFrame;

  try {
    host.appendChild(entityFrame);
  } catch (error) {
    frame = null;
    entityFrame.remove();
    throw error;
  }
}

export function stop() {
  if (!frame) return;

  const entityFrame = frame;

  // Invalidar primer la instància activa.
  frame = null;

  // Desconnectar l'entitat i els seus recursos.
  entityFrame.src = "about:blank";
  entityFrame.remove();
}
