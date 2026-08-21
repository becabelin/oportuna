export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startColetaLoop } = await import("./lib/coleta-loop");
    startColetaLoop();
  }
}
