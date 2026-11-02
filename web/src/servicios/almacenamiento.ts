const ES_VERIFICADOR = /code-verifier$/;
const VIGENCIA_COOKIE = 600;

const intentar = <T>(accion: () => T): T | null => {
  try {
    return accion();
  } catch {
    return null;
  }
};

const leerCookie = (nombre: string) => {
  const par = document.cookie.split('; ').find((fila) => fila.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : null;
};

const escribirCookie = (nombre: string, valor: string, segundos: number) => {
  const seguro = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; path=/; max-age=${segundos}; SameSite=Lax${seguro}`;
};

// El código temporal del login (PKCE) debe sobrevivir al viaje a Google. Safari, sobre todo en
// pestañas privadas, puede borrar el almacenamiento local en ese viaje, así que se guarda también
// en sessionStorage y en una cookie de 10 minutos.
export const almacenamientoDeSesion = {
  getItem: (clave: string) => {
    const local = intentar(() => window.localStorage.getItem(clave));
    if (local !== null || !ES_VERIFICADOR.test(clave)) return local;
    return intentar(() => window.sessionStorage.getItem(clave)) ?? intentar(() => leerCookie(clave));
  },
  setItem: (clave: string, valor: string) => {
    intentar(() => window.localStorage.setItem(clave, valor));
    if (!ES_VERIFICADOR.test(clave)) return;
    intentar(() => window.sessionStorage.setItem(clave, valor));
    intentar(() => escribirCookie(clave, valor, VIGENCIA_COOKIE));
  },
  removeItem: (clave: string) => {
    intentar(() => window.localStorage.removeItem(clave));
    if (!ES_VERIFICADOR.test(clave)) return;
    intentar(() => window.sessionStorage.removeItem(clave));
    intentar(() => escribirCookie(clave, '', 0));
  },
};
