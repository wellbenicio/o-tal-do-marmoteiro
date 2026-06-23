import { upsertCustomerByEmail } from "./customer.repository";

export function createOrUpdateCustomer(input: {
  name: string;
  email: string;
  phone: string;
}) {
  return upsertCustomerByEmail(input.email.toLowerCase(), {
    name: input.name,
    phone: input.phone
  });
}
