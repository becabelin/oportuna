export const INTERVALO_COLETA_MS = 30 * 60 * 1000;

const globalForLoop = globalThis as unknown as {
  __oportunaColetaLoop?: ReturnType<typeof setInterval>;
};

export function startColetaLoop() {
  if (globalForLoop.__oportunaColetaLoop) return;
  const run = async () => {
    const { coletarTodas } = await import("./coleta");
    try {
      await coletarTodas();
    } catch (error) {
      console.error("[trilha] coleta periódica falhou", error);
    }
  };
  setTimeout(() => {
    void run();
  }, 2_500);
  globalForLoop.__oportunaColetaLoop = setInterval(() => {
    void run();
  }, INTERVALO_COLETA_MS);
}
