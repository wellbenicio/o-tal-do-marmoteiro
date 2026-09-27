export class ProviderError extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable = false,
    public readonly uncertain = false,
  ) {
    super(code);
  }
}
export type CalendarAppointment = {
  reference: string;
  startsAt: Date;
  endsAt: Date;
  customerEmail: string;
};
export type CalendarEvent = {
  id: string;
  status?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  attendees?: { email: string }[];
  conferenceData?: {
    createRequest?: { status?: { statusCode?: string } };
    entryPoints?: { entryPointType: string; uri: string }[];
  };
};
