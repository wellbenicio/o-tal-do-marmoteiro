# ADR 0012: Autenticação e RBAC

**Status:** Reconciliada com as ADRs 0002/0003 em 25/09/2026
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seção 7 (Autenticação), seção 28 (Controle de acesso administrativo), seção 35 (Segurança mínima esperada) e seção 38 (itens 6 "modelo de autorização" e 7 "estratégia de autenticação").

## Decisão vigente após a reconciliação

- O login administrativo real da ADR 0002 permanece em `/admin/auth/*`, com chave privada do BFF, limitação persistida, contas provisionadas e cookies protegidos na web. Não existe signup administrativo público.
- `SessionStore` é ligado a `PersistentAdminSessionStore`, que consulta `AdminAuthService` e o PostgreSQL. `find` revalida expiração, revogação, conta ativa e papel `OWNER`; converte esse proprietário autorizado em `AuthRole.ADMIN`. `revoke` revoga a sessão persistida. `create` recusa emissão fora do fluxo de login com credenciais e limitação de tentativas.
- `InMemorySessionStore` permanece como dublê de testes, sem registro no módulo de produção. A identidade futura dos consulentes continua sob a direção Firebase da ADR 0003; nenhum token em memória autoriza conta real.
- `ScryptPasswordHasher` reutiliza `hashPassword`/`verifyPassword` da autenticação atual: N=32768, r=8, p=3, sal de 16 bytes, chave de 64 bytes e formato versionado `scrypt$N$r$p$salt$key`. Novas senhas respeitam 15 a 128 caracteres; não se migram nem se reescrevem hashes já persistidos.
- `AdminRole` preserva `OWNER` e o valor histórico `ADMIN`; o padrão é `OWNER`. Preservar `ADMIN` no banco não concede acesso: os guards existentes continuam recusando papéis diferentes de `OWNER`.
- A migration vigente é `20260925140000_reconcile_domain_enums`: converte o tipo sem remover a coluna nem alterar o valor do papel. Papéis desconhecidos interrompem a migration para revisão.
- Os contratos HTTP de domínio permanecem cálculos sem leitura ou mutação de recursos. A autorização dos futuros comandos persistentes deve ser definida por recurso; um resultado calculado não é aprovação financeira nem administrativa.

Os trechos abaixo registram a proposta original. Onde divergirem, a decisão vigente acima prevalece; a sessão em memória e o formato antigo de hash não são a configuração da aplicação integrada.

## Contexto histórico

A seção 38 lista "modelo de autorização" (item 6) e "estratégia de
autenticação" (item 7) como itens do checklist da etapa técnica. Assim como
o contrato de API da ADR 0011, são decisões técnicas puras — não dependem
de fornecedor externo nem de dado operacional ainda não definido pelo dono
do produto — então podem avançar agora.

A seção 7.3 exige "controle seguro de sessão" e "revogação de sessão
quando necessário", mas fecha com "detalhes de implementação serão
definidos na especificação técnica" — ou seja, o *mecanismo* é
deliberadamente delegado a esta ADR. A seção 28 exige que o modelo "não
assuma que todo administrador futuro possui acesso irrestrito" e que "a
solução técnica deverá permitir evolução para RBAC/permissões" — sem
detalhar papéis além do único `Administrador` hoje existente (seção 4.3).
A seção 35 lista "hashing seguro de senha", "sessão/autenticação segura",
"autorização" e "RBAC" entre os itens que a especificação técnica deve
obrigatoriamente abordar.

Os modelos `Identity` e `AdminUser` (schema Prisma) já continham
`passwordHash` e comentários "ADR pendente" apontando exatamente para essas
duas lacunas (sessão/token em `Identity`; RBAC em `AdminUser.role`).

Esta ADR resolve apenas o **mecanismo** de autenticação/RBAC (hashing,
sessão, guards HTTP), reutilizável por qualquer controller futuro. Não
resolve *quais* endpoints exigem *quais* papéis — isso depende dos casos de
uso completos (ainda não modelados) e está fora do escopo aqui, assim como
já declarado nos "Pontos em aberto" da ADR 0011.

## Decisão

### Estratégia de sessão: token opaco + armazenamento server-side (não JWT)

Login emite um token opaco aleatório (`randomBytes(32).toString('hex')`),
associado a um `Session { token, principalId, role, expiresAt }` guardado
em `SessionStore`. Requisições autenticadas enviam o token no cabeçalho
HTTP `Authorization`, usando o esquema de autenticação `Bearer` (RFC 6750).

Rejeitada a alternativa JWT (ver "Alternativas consideradas") justamente
porque a seção 7.3 exige "revogação de sessão quando necessário": com token
opaco + store, revogar é apagar a entrada; com JWT stateless, revogar
exigiria uma allowlist/denylist adicional — a mesma complexidade de um
store, sem o benefício de auto-contenção.

### `SessionStore` — porta assíncrona + implementação em memória

```
abstract class SessionStore {
  abstract create(principalId, role, ttlMs): Promise<Session>;
  abstract find(token): Promise<Session | undefined>;
  abstract revoke(token): Promise<void>;
}
```

Mesmo padrão porta+fake já usado para `BusinessHoursCalendar` (ADR 0009):
só `InMemorySessionStore` (`Map` em memória) é fornecida. Um backend real
persistente entre reinícios do processo e compartilhado entre instâncias
(ex.: Redis) é decisão de infraestrutura fora do escopo atual — ver
"Pontos em aberto".

Diferença deliberada em relação à `BusinessHoursCalendar`: os métodos são
`Promise`-based, não síncronos. Um backend real de sessão é genuinamente
dependente de I/O (rede), então a porta já nasce com a assinatura que a
implementação real vai precisar, evitando uma quebra de contrato quando o
backend real chegar.

### `PasswordHasher` — porta com implementação real (não uma fake)

```
abstract class PasswordHasher {
  abstract hash(plain): Promise<string>;
  abstract verify(plain, storedHash): Promise<boolean>;
}
```

Diferente de `SessionStore`, `ScryptPasswordHasher` é uma implementação
**real e final**, não uma fake temporária: hashing de senha é decisão
puramente técnica, não depende de nenhum fornecedor externo nem de dado de
negócio pendente. Usa `crypto.scrypt` (módulo nativo do Node — nenhuma
dependência nova), salt aleatório de 16 bytes por hash (armazenado como
`saltHex:keyHex`) e `timingSafeEqual` para comparação em tempo constante na
verificação (evitando *timing attacks*).

### `AdminRole` — RBAC administrativo (seção 28)

`AdminUser.role` deixa de ser `String` livre e passa a ser o enum
`AdminRole { ADMIN }` (schema Prisma, migração
`20260902190000_add_admin_role_enum`, mirror em
`packages/shared/src/admin-role.ts`). Hoje só existe um valor, mas é o
*enum* — não um único valor de `String` — que satisfaz a exigência da
seção 28 de "permitir evolução para RBAC/permissões": adicionar um novo
papel administrativo no futuro é adicionar um valor ao enum, não uma
migração de tipo de coluna.

### `AuthRole` — tipo de principal autenticado (guard, não persistido)

`AuthRole { CUSTOMER, ADMIN }` (`packages/shared/src/auth-role.ts`)
distingue Consulente (seção 4.2) de Administrador (seção 4.3) na camada de
guards HTTP. **Não é um enum Prisma nem uma coluna persistida** — é
resolvido em tempo de requisição a partir de qual tabela (`Identity` vs.
`AdminUser`) autenticou a sessão. Não confundir com `AdminRole`, que é RBAC
*dentro* do painel administrativo. "Visitante" (seção 4.1) não é um valor
deste enum — é a ausência de um `Principal` autenticado.

### `AuthGuard` e `RolesGuard`

- **`AuthGuard`** (`CanActivate`): extrai o token `Bearer` do cabeçalho
  `Authorization`, consulta `SessionStore.find`, lança
  `UnauthorizedException` (401 — integra-se ao `DomainErrorFilter` da ADR
  0011 pelo ramo `HttpException`) se ausente/inválido/expirado, ou anexa
  `Principal { id, role }` a `request.principal`.
- **`RolesGuard`** (`CanActivate`): lê os `AuthRole` exigidos via
  `@Roles(...)` (metadata `Reflector`); sem `@Roles` declarado, libera o
  acesso; caso contrário, nega (retorna `false`, não lança) se
  `request.principal` estiver ausente ou seu papel não estiver na lista —
  defensivo, pressupõe que `AuthGuard` roda antes.

Ambos ficam em `apps/api/src/modules/identity/`, exportados por
`IdentityModule` para uso por controllers futuros via
`@UseGuards(AuthGuard, RolesGuard)` / `@Roles(AuthRole.ADMIN)`.

## Consequências

- `apps/api/prisma/schema.prisma`: novo enum `AdminRole`; `AdminUser.role`
  muda de `String` para `AdminRole @default(ADMIN)`; comentário de
  `Identity` atualizado para apontar para esta ADR. Migração
  `20260902190000_add_admin_role_enum` criada manualmente (sem Postgres
  disponível neste ambiente para `prisma migrate dev`), seguindo
  exatamente o formato gerado pela migração precedente de conversão
  `String`→enum (`20260821200601_...`).
- Nenhuma nova dependência de npm — `crypto`/`util`/`nestjs/common` já
  disponíveis.
- `IdentityModule` deixa de ser um stub vazio; passa a exportar
  `PasswordHasher`, `SessionStore`, `AuthGuard`, `RolesGuard`. Já estava
  importado em `AppModule` (nenhuma mudança necessária lá).
- Nenhum dos 9 controllers da ADR 0011 recebeu `@UseGuards`/`@Roles` — ver
  "Pontos em aberto".

### Pontos em aberto

1. **Nenhum endpoint HTTP real de login/logout.** Esta ADR entrega o
   mecanismo (hash, sessão, guards) isoladamente testado, não um caso de
   uso de "login" completo — que cruzaria `Identity`/`AdminUser` via
   Prisma e exigiria política de rate limiting/proteção a força bruta
   (seção 7.3, seção 35), fora do escopo mínimo aqui.
2. **Recuperação de senha, rate limiting, CSRF** (seção 7.3, seção 35) —
   não tratados nesta ADR; dependem de um caso de uso de e-mail/notificação
   (ADR 0013) e de infraestrutura (ex. armazenamento de tentativas) ainda
   não definida.
3. **`SessionStore` real (Redis ou equivalente).** `InMemorySessionStore`
   não sobrevive a reinícios do processo nem escala além de uma instância —
   suficiente para viabilizar o mecanismo de ponta a ponta em
   desenvolvimento/teste. Escolha de backend é decisão de infraestrutura,
   a tratar quando o ambiente de hospedagem for definido.
4. **Guards não aplicados a nenhum controller existente.** Decidir quais
   dos 9 controllers da ADR 0011 exigem autenticação e/ou qual `AuthRole`
   depende do caso de uso completo de cada um (ainda não modelado) — seria
   inventar regra de negócio não especificada (seção 38).
5. **`AdminRole` com um único valor.** A especificação (seção 4.3, seção
   28) não define papéis administrativos além de "Administrador/Oraculista";
   novos valores só devem ser adicionados quando o dono do produto
   especificar papéis administrativos adicionais.

## Alternativas consideradas

- **JWT (stateless) em vez de token opaco + `SessionStore`** — rejeitada:
  a seção 7.3 exige revogação de sessão sob demanda; JWT sem estado exige
  uma allowlist/denylist adicional para permitir revogação, recriando a
  necessidade de um store — sem ganhar a simplicidade que motiva o uso de
  JWT em outros contextos (ex. sistemas distribuídos sem armazenamento
  compartilhado, que não é o caso aqui).
- **`bcrypt`/`argon2` (dependência de terceiros) em vez de `crypto.scrypt`
  nativo** — rejeitada por ora: `scrypt` é reconhecido como
  criptograficamente adequado para hashing de senha, já está disponível no
  runtime do Node sem instalar nada, e evita introduzir uma dependência
  binária/nativa adicional (bcrypt/argon2 tipicamente exigem compilação
  nativa) numa etapa em que nenhuma decisão de infraestrutura de deploy
  ainda foi tomada. Pode ser revisitada se uma necessidade específica
  surgir (ex. paridade com hashes gerados por outro sistema).
- **`interface` simples (como `BusinessHoursCalendar`) em vez de `abstract
  class`** para `PasswordHasher`/`SessionStore` — rejeitada: interfaces
  puras do TypeScript não têm representação em tempo de execução e não
  podem ser usadas como token de injeção de dependência do NestJS.
  `BusinessHoursCalendar` não precisa disso porque nunca é injetado via DI
  (é passado como parâmetro direto à função pura); `PasswordHasher`/
  `SessionStore` precisam ser resolvidos pelo container do NestJS dentro de
  `AuthGuard`.
- **RBAC granular já nesta etapa (múltiplos papéis administrativos,
  permissões por recurso)** — rejeitada: a especificação (seção 4.3, seção
  28) só define o papel único "Administrador/Oraculista"; inventar papéis
  adicionais sem que o dono do produto os tenha especificado violaria a
  seção 38.
