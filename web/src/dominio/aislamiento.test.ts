import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// El dominio es lógica pura y portable (también debe poder correr en una Edge Function de Deno):
// solo puede importar otros archivos del dominio y nunca depender de React, Supabase ni de la app.
describe('aislamiento del dominio', () => {
  const carpeta = __dirname;
  const archivos = readdirSync(carpeta).filter((nombre) => nombre.endsWith('.ts') && !nombre.endsWith('.test.ts'));

  it.each(archivos)('%s solo importa del dominio', (archivo) => {
    const importaciones = [...readFileSync(join(carpeta, archivo), 'utf-8').matchAll(/from\s+'([^']+)'/g)].map((coincidencia) => coincidencia[1]);
    importaciones.forEach((especificador) => expect(especificador.startsWith('./'), `${archivo} importa ${especificador}`).toBe(true));
  });
});
