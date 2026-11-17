let frame = null;

export function start() {

  
  if (frame) return;

  const host =
    document.querySelector("[data-entity-host]") ||
    document.body;

  const entityFrame = document.createElement("iframe");

  entityFrame.src = new URL("./index.html", import.meta.url).href;

  entityFrame.title = "ZERO INFINIT — Terra porpra";

  entityFrame.setAttribute("sandbox", "allow-scripts");
  entityFrame.setAttribute("allow", "autoplay");

  Object.assign(entityFrame.style, {
    display: "block",
    width: "100%",
    height: "100%",
    border: "0",
    margin: "0",
    padding: "0",
    overflow: "hidden"
  });

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

  frame = null;

  entityFrame.src = "about:blank";
  entityFrame.remove();
}