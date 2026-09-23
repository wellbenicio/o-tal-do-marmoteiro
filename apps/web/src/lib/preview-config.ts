// Fixture configuration for visual validation; replace with Catalog/Scheduling API.
// These are examples, not the operation's approved prices or calendar.
export const previewConfig = {
  appointment: { amount: 7000, durationMinutes: 30, holdMinutes: 15 },
  question: { amount: 5000, priorityAmount: 2000 },
  calendar: {
    timezone: "America/Sao_Paulo",
    slots: [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ],
  },
  // No operational calendar was approved: never derive an actual 48-business-hour deadline.
  businessCalendar: null,
};
