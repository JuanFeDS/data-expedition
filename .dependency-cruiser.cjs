module.exports = {
  forbidden: [
    {
      name: 'dominio-sin-dependencias',
      severity: 'error',
      comment: 'El dominio corre también en Deno: solo puede importar otros archivos del dominio.',
      from: { path: '^src/dominio' },
      to: { pathNot: '^src/dominio' },
    },
    {
      name: 'puertos-solo-dominio',
      severity: 'error',
      from: { path: '^src/puertos' },
      to: { pathNot: '^src/(dominio|puertos)' },
    },
    {
      name: 'casos-de-uso-solo-dominio-y-puertos',
      severity: 'error',
      from: { path: '^src/casos-de-uso' },
      to: { pathNot: '^src/(dominio|puertos|casos-de-uso)' },
    },
    {
      name: 'src-no-importa-web',
      severity: 'error',
      from: { path: '^src' },
      to: { path: '^web' },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: {
      extensions: ['.ts', '.js'],
      mainFields: ['module', 'main', 'types'],
    },
  },
};
