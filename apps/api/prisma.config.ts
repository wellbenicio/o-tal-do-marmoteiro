import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: a URL de conexão não é mais lida do bloco `datasource` do
// schema.prisma — precisa ser fornecida aqui para os comandos de CLI
// (migrate, studio etc.). Em runtime, a aplicação conecta via driver
// adapter (ver src/prisma/prisma.service.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  },
});
