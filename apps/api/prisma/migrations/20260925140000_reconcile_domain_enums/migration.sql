BEGIN;

CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'CANCELLATION_REQUESTED', 'CANCELLED');
CREATE TYPE "AppointmentStatus" AS ENUM ('NOT_STARTED', 'SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE "RescheduleRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED');
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN');
CREATE TYPE "DataCorrectionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'ADJUSTED', 'REJECTED');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus"
  USING (CASE WHEN "status" = 'CANCELED' THEN 'CANCELLED' ELSE "status" END)::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CREATED';

ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus"
  USING (CASE "status" WHEN 'BOOKED' THEN 'SCHEDULED' WHEN 'CANCELED' THEN 'CANCELLED' ELSE "status" END)::"AppointmentStatus";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" TYPE "RescheduleRequestStatus"
  USING (CASE WHEN "status" = 'OPEN' THEN 'PENDING' ELSE "status" END)::"RescheduleRequestStatus";
ALTER TABLE "RescheduleRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "AdminUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "AdminUser" ALTER COLUMN "role" TYPE "AdminRole" USING "role"::"AdminRole";
ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'OWNER';

ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" TYPE "DataCorrectionRequestStatus"
  USING (CASE WHEN "status" = 'RECEIVED' THEN 'PENDING' ELSE "status" END)::"DataCorrectionRequestStatus";
ALTER TABLE "DataCorrectionRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';

COMMIT;