BEGIN;

DO $migration$
DECLARE
  cancelled_status CONSTANT text := 'CANCELLED';
  pending_status CONSTANT text := 'PENDING';
BEGIN
  EXECUTE format(
    'CREATE TYPE "OrderStatus" AS ENUM (''CREATED'', ''CONFIRMED'', ''CANCELLATION_REQUESTED'', %L)',
    cancelled_status
  );
  EXECUTE format(
    'CREATE TYPE "AppointmentStatus" AS ENUM (''NOT_STARTED'', ''SCHEDULED'', ''COMPLETED'', ''NO_SHOW'', %L)',
    cancelled_status
  );
  EXECUTE format(
    'CREATE TYPE "RescheduleRequestStatus" AS ENUM (%L, ''CONFIRMED'', ''EXPIRED'')',
    pending_status
  );
  CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN');
  EXECUTE format(
    'CREATE TYPE "DataCorrectionRequestStatus" AS ENUM (%L, ''APPROVED'', ''ADJUSTED'', ''REJECTED'')',
    pending_status
  );

  ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
  EXECUTE format(
    'ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (CASE WHEN "status" = ''CANCELED'' THEN %L ELSE "status" END)::"OrderStatus"',
    cancelled_status
  );
  ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CREATED';

  ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
  EXECUTE format(
    'ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus" USING (CASE "status" WHEN ''BOOKED'' THEN ''SCHEDULED'' WHEN ''CANCELED'' THEN %L ELSE "status" END)::"AppointmentStatus"',
    cancelled_status
  );
  ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

  ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" DROP DEFAULT;
  EXECUTE format(
    'ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" TYPE "RescheduleRequestStatus" USING (CASE WHEN "status" = ''OPEN'' THEN %L ELSE "status" END)::"RescheduleRequestStatus"',
    pending_status
  );
  EXECUTE format('ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" SET DEFAULT %L', pending_status);

  ALTER TABLE "AdminUser" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "AdminUser" ALTER COLUMN "role" TYPE "AdminRole" USING "role"::"AdminRole";
  ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'OWNER';

  ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" DROP DEFAULT;
  EXECUTE format(
    'ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" TYPE "DataCorrectionRequestStatus" USING (CASE WHEN "status" = ''RECEIVED'' THEN %L ELSE "status" END)::"DataCorrectionRequestStatus"',
    pending_status
  );
  EXECUTE format('ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" SET DEFAULT %L', pending_status);
END;
$migration$;

COMMIT;
