import { AppError } from "@/lib/errors";
import { findActiveServiceById, listActiveServices } from "./service.repository";

export async function getActiveServices() {
  return listActiveServices();
}

export async function getActiveServiceOrThrow(serviceId: string) {
  const service = await findActiveServiceById(serviceId);

  if (!service) {
    throw new AppError("Serviço não encontrado.", 404);
  }

  return service;
}
