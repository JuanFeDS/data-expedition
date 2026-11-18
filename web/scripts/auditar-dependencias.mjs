import { execSync } from "node:child_process";

// GHSA-fc5q-39xc-vjpf (picomatch): retirado por GitHub el 2026-11-18 y sin versión corregida, pero npm audit aún lo reporta.
// Quitar esta excepción cuando npm sincronice el retiro.
const AVISOS_IGNORADOS = process.env.AUDITORIA_SIN_EXCEPCIONES
  ? new Set()
  : new Set(["https://github.com/advisories/GHSA-fc5q-39xc-vjpf"]);
const SEVERIDADES_QUE_BLOQUEAN = new Set(["high", "critical"]);

function leerInforme() {
  let salida;
  try {
    salida = execSync("npm audit --json", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    salida = error.stdout;
  }
  const informe = JSON.parse(salida);
  if (informe.error) {
    throw new Error(`npm audit falló: ${informe.error.summary ?? informe.error.code}`);
  }
  return informe;
}

function avisosDelInforme(informe) {
  const avisos = new Map();
  for (const vulnerabilidad of Object.values(informe.vulnerabilities ?? {})) {
    for (const via of vulnerabilidad.via) {
      if (typeof via === "object" && SEVERIDADES_QUE_BLOQUEAN.has(via.severity)) {
        avisos.set(via.url, via);
      }
    }
  }
  return [...avisos.values()];
}

const avisos = avisosDelInforme(leerInforme());
const ignorados = avisos.filter((aviso) => AVISOS_IGNORADOS.has(aviso.url));
const pendientes = avisos.filter((aviso) => !AVISOS_IGNORADOS.has(aviso.url));

for (const aviso of ignorados) {
  console.log(`Aviso ignorado: ${aviso.url} (${aviso.title})`);
}
for (const aviso of pendientes) {
  console.error(`VULNERABILIDAD ${aviso.severity}: ${aviso.name}, ${aviso.title}, ${aviso.url}`);
}
if (pendientes.length > 0) {
  console.error(`${pendientes.length} aviso(s) de severidad alta o crítica sin excepción.`);
  process.exit(1);
}
console.log("Auditoría de dependencias correcta: sin avisos altos o críticos fuera de la excepción.");
