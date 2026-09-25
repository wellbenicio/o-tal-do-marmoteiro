import test from "node:test";
import assert from "node:assert/strict";
import { safeAdminReturn } from "./admin-routes";

test("administrative login returns only to local management pages", () => {
  assert.equal(safeAdminReturn("/gestao/perguntas"), "/gestao/perguntas");
  assert.equal(
    safeAdminReturn("/gestao/pedidos?pedido=MRM-123"),
    "/gestao/pedidos?pedido=MRM-123",
  );
  for (const target of [
    undefined,
    "https://example.com",
    "//example.com",
    "/gestao/../login",
    "/gestao\\example.com",
    "/gestao/login",
    "/gestao/login?next=/gestao",
    "/gestao?x=\r\nLocation:evil",
  ]) {
    assert.equal(safeAdminReturn(target), "/gestao");
  }
});
