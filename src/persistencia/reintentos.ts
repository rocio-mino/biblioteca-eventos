export async function conReintentos<T>(
  operacion: () => Promise<T>,
  maxIntentos = 5,
  esperaInicialMs = 500,
): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    try {
      return await operacion();
    } catch (error) {
      ultimoError = error;

      const codigo = (error as { code?: string }).code;

      // Errores de datos inválidos o restricciones:
      // no tiene sentido reintentar.
      if (
        codigo === '23505' ||
        codigo === '23514' ||
        codigo === '23502' ||
        codigo === '22P02'
      ) {
        throw error;
      }

      if (intento === maxIntentos) {
        throw error;
      }

      const espera = esperaInicialMs * 2 ** (intento - 1);

      console.warn(
        `[reintentos] intento ${intento}/${maxIntentos} falló. ` +
          `Reintentando en ${espera} ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }

  throw ultimoError;
}