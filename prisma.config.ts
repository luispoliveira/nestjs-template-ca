import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  experimental: {
    adapter: true,
  },
  schema: path.join('zenstack', 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join('zenstack', 'prisma', 'migrations'),
  },
  views: {
    path: path.join('zenstack', 'prisma', 'views'),
  },
  typedSql: {
    path: path.join('zenstack', 'prisma', 'typed-sql'),
  },
} satisfies PrismaConfig;
