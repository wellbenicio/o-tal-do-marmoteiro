import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';

const suite =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;
const migrations = resolve(__dirname, '../../prisma/migrations');
const previousMigrations = [
  '20260821192524_init',
  '20260921202546_administrative_sessions',
  '20260922170000_appointment_communications',
];
const trackedTables = [
  'AdminUser',
  'AdminSession',
  'Order',
  'Appointment',
  'RescheduleRequest',
  'DataCorrectionRequest',
  'ServiceExecution',
  'AppointmentCommunication',
  'AppointmentReminderConsent',
  'AuditLog',
] as const;
type TrackedTable = (typeof trackedTables)[number];
type Row = Record<string, unknown>;
type Snapshot = Record<TrackedTable, Row[]>;

suite('domain enum migration preserves existing data', () => {
  let client: Client;
  let schema: string;
  let schemaCreated = false;
  let migration: string;

  async function snapshot(): Promise<Snapshot> {
    const entries: [TrackedTable, Row[]][] = [];
    for (const table of trackedTables) {
      const result = await client.query<Row>(`SELECT * FROM "${table}"`);
      entries.push([table, result.rows]);
    }
    return Object.fromEntries(entries) as Snapshot;
  }

  beforeEach(async () => {
    schema = 'pr6_migration_' + randomUUID().replaceAll('-', '');
    schemaCreated = false;
    client = new Client({
      connectionString:
        process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    });
    await client.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    await client.query(`SET search_path TO "${schema}"`);
    for (const name of previousMigrations) {
      await client.query(
        await readFile(resolve(migrations, name, 'migration.sql'), 'utf8'),
      );
    }
    migration = await readFile(
      resolve(
        migrations,
        '20260925140000_reconcile_domain_enums/migration.sql',
      ),
      'utf8',
    );
    await client.query(`
      INSERT INTO "Customer" ("id", "legalName", "birthDate", "motherName", "genderIdentity", "updatedAt")
      VALUES ('customer', 'Fixture Customer', '1990-01-01', 'Fixture Parent', 'Fixture', '2026-09-01');
      INSERT INTO "Order" ("id", "customerId", "status", "totalAmount", "updatedAt") VALUES
        ('scheduled', 'customer', 'CONFIRMED', 70, '2026-09-01'),
        ('cancelled', 'customer', 'CANCELED', 70, '2026-09-01'),
        ('review', 'customer', 'CANCELLATION_REQUESTED', 70, '2026-09-01');
      INSERT INTO "AppointmentSlot" ("id", "startsAt", "endsAt", "status", "updatedAt") VALUES
        ('slot', '2026-10-01 14:00', '2026-10-01 14:30', 'BOOKED', '2026-09-01');
      INSERT INTO "Appointment" ("id", "orderId", "slotId", "status", "updatedAt") VALUES
        ('appointment', 'scheduled', 'slot', 'BOOKED', '2026-09-01'),
        ('cancelled-appointment', 'cancelled', 'slot', 'CANCELED', '2026-09-01');
      INSERT INTO "RescheduleRequest" ("id", "appointmentId", "originalSlotId", "status", "optionsExpireAt")
      VALUES ('request', 'appointment', 'slot', 'OPEN', '2026-10-01');
      INSERT INTO "DataCorrectionRequest" ("id", "customerId", "field", "currentValue", "requestedValue", "status", "decisionJustification") VALUES
        ('pending-correction', 'customer', 'legalName', 'Before', 'After', 'RECEIVED', NULL),
        ('decided-correction', 'customer', 'legalName', 'Before', 'After', 'ADJUSTED', 'Recorded decision');
      INSERT INTO "AppointmentCommunication" ("appointmentId", "calendarId", "eventId", "updatedAt")
      VALUES ('appointment', 'fixture-calendar', 'fixture-event', '2026-09-01');
      INSERT INTO "AppointmentReminderConsent" ("appointmentId", "granted", "phone", "version", "decidedAt")
      VALUES ('appointment', true, '5585999990000', 'v1', '2026-09-01');
    `);
    await client.query(
      `INSERT INTO "AdminUser" ("id", "name", "email", "passwordHash", "role", "updatedAt") VALUES
      ('owner', 'Fixture Owner', 'owner@example.com', $1, 'OWNER', '2026-09-01'),
      ('legacy-admin', 'Fixture Admin', 'admin@example.com', $1, 'ADMIN', '2026-09-01')`,
      [randomUUID()],
    );
    await client.query(
      `INSERT INTO "AdminSession" ("id", "tokenHash", "adminId", "expiresAt") VALUES
      ('session', $1, 'owner', '2026-10-01')`,
      [randomUUID()],
    );
    await client.query(`
      INSERT INTO "ServiceExecution" ("id", "orderId", "modality", "startedAt", "completedAt", "performedByAdminId", "updatedAt")
      VALUES ('execution', 'scheduled', 'APPOINTMENT', '2026-09-01 14:00', '2026-09-01 14:30', 'owner', '2026-09-01');
      INSERT INTO "AuditLog" ("id", "actorAdminId", "entityType", "entityId", "action")
      VALUES ('audit', 'owner', 'SERVICE', 'execution', 'COMPLETED');
    `);
  }, 30000);

  afterEach(async () => {
    if (schemaCreated) {
      await client.query('ROLLBACK');
      await client.query(`DROP SCHEMA "${schema}" CASCADE`);
    }
    await client?.end();
  });

  it('converts known names and preserves accounts, sessions, decisions and execution history', async () => {
    const before = await snapshot();
    await client.query(migration);
    const after = await snapshot();
    const mappings: Partial<Record<TrackedTable, Record<string, string>>> = {
      Order: { CANCELED: 'CANCELLED' },
      Appointment: { BOOKED: 'SCHEDULED', CANCELED: 'CANCELLED' },
      RescheduleRequest: { OPEN: 'PENDING' },
      DataCorrectionRequest: { RECEIVED: 'PENDING' },
    };
    for (const table of trackedTables) {
      const expected = before[table].map((row) => {
        const replacement = mappings[table]?.[String(row.status)];
        return replacement ? { ...row, status: replacement } : row;
      });
      expect(after[table]).toEqual(expected);
    }
  });

  it('rolls back the whole migration when an unknown role cannot be converted', async () => {
    await client.query('UPDATE "AdminUser" SET "role" = $1 WHERE "id" = $2', [
      'UNREVIEWED_ROLE',
      'legacy-admin',
    ]);
    const before = await snapshot();
    await expect(client.query(migration)).rejects.toThrow('AdminRole');
    await client.query('ROLLBACK');
    expect(await snapshot()).toEqual(before);
    const types = await client.query<{ count: string }>(
      'SELECT count(*) FROM pg_type WHERE typnamespace = $1::regnamespace AND typname = $2',
      [schema, 'OrderStatus'],
    );
    expect(types.rows[0].count).toBe('0');
  });
});
