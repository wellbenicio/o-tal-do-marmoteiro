# O Tal do Marmoteiro

Landing page e backend/API para agendamento online de consulta de cartomancia.

## Fluxo de trabalho

- `main`: ambiente validado e estável.
- `dev`: integração ativa e base para validação.
- `features/{implementacao}`: branches de implementação criadas a partir de `dev`.

Commits seguem o padrão semântico: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:` e `ci:`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL
- Zod

## Setup local

Execute na raiz do repositório:

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
npx prisma generate
```

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma db seed
```

```bash
npm run dev
```

## Endpoints iniciais

- `GET /api/health`
- `GET /api/services`
- `GET /api/availability?serviceId=&date=YYYY-MM-DD`
- `POST /api/bookings/checkout`
- `GET /api/bookings/[publicToken]`
- `POST /api/webhooks/mercado-pago`

## Fluxo mockado

O checkout inicial aponta para `/pagamento/mock?booking=publicToken`.

Essa página existe apenas para desenvolvimento local e permite simular pagamento aprovado, pendente ou rejeitado. O agendamento só vira `CONFIRMED` quando o pagamento mockado é aprovado.

## Figma

O Figma é a fonte principal para a fidelidade visual da landing. Se o conector estiver sem acesso de editor ao arquivo, a implementação funcional pode seguir o padrão visual descrito em `docs/project-context.md` e ser refinada depois contra o protótipo.
