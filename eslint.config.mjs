import next from 'eslint-config-next'

const config = [
  ...next,
  {
    ignores: ['node_modules/**', '.next/**', 'public/**', 'pnpm-lock.yaml', 'next-env.d.ts'],
  },
]

export default config
