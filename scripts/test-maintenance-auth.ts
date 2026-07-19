import assert from "node:assert/strict";
import {isMaintenanceAuthorized} from "../lib/maintenance-auth.ts";
process.env.MAINTENANCE_SECRET = "very-secret";
assert.equal(isMaintenanceAuthorized(new Request("http://x", {headers:{authorization:"Bearer very-secret"}})), true);
assert.equal(isMaintenanceAuthorized(new Request("http://x", {headers:{authorization:"Bearer wrong"}})), false);
delete process.env.MAINTENANCE_SECRET;
assert.equal(isMaintenanceAuthorized(new Request("http://x")), false);
console.log("maintenance auth: ok");
