import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError } from "./errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function handleApiError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: error.issues },
      { status: 422 }
    );
  }

  console.error(error);
  return NextResponse.json({ error: "Erro interno." }, { status: 500 });
}
