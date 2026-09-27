// FormData.get() returns string | File | null; keep only string values so
// callers never stringify a File into "[object Object]".
export function formString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}
