-- AlterTable
ALTER TABLE "OutboxMessage" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deduplicationKey" TEXT,
ADD COLUMN     "lastErrorCode" TEXT,
ADD COLUMN     "leaseUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AppointmentCommunication" (
    "appointmentId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "calendarUrl" TEXT,
    "meetUrl" TEXT,
    "syncedRevision" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentCommunication_pkey" PRIMARY KEY ("appointmentId")
);

-- CreateTable
CREATE TABLE "AppointmentReminderConsent" (
    "appointmentId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "phone" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AppointmentReminderConsent_pkey" PRIMARY KEY ("appointmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutboxMessage_deduplicationKey_key" ON "OutboxMessage"("deduplicationKey");

-- CreateIndex
CREATE INDEX "OutboxMessage_status_availableAt_idx" ON "OutboxMessage"("status", "availableAt");

-- AddForeignKey
ALTER TABLE "AppointmentCommunication" ADD CONSTRAINT "AppointmentCommunication_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminderConsent" ADD CONSTRAINT "AppointmentReminderConsent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
