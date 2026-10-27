import { AuditLogEntry, Role } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __APAAR_AUDIT__: AuditLogEntry[] | undefined;
}

function getAuditTrail(): AuditLogEntry[] {
  if (!globalThis.__APAAR_AUDIT__) {
    globalThis.__APAAR_AUDIT__ = [];
  }
  return globalThis.__APAAR_AUDIT__;
}

export interface CreateAuditInput {
  actorEmail: string;
  actorRole: Role;
  actorName: string;
  action: AuditLogEntry["action"];
  resource: AuditLogEntry["resource"];
  resourceId?: string;
  institutionId?: string;
  institutionName?: string;
  details: string;
  outcome?: "SUCCESS" | "FAILURE" | "DENIED";
  ipAddress?: string;
}

export function recordAuditEvent(input: CreateAuditInput): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    actorName: input.actorName,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    institutionId: input.institutionId,
    institutionName: input.institutionName,
    details: input.details,
    outcome: input.outcome || "SUCCESS",
    ipAddress: input.ipAddress || "127.0.0.1",
  };

  const auditTrail = getAuditTrail();
  auditTrail.unshift(entry);

  if (auditTrail.length > 1000) {
    auditTrail.pop();
  }

  return entry;
}

export function getAuditLogs(filter?: {
  institutionId?: string;
  actorRole?: Role;
  resource?: string;
  action?: string;
  search?: string;
}): AuditLogEntry[] {
  let list = [...getAuditTrail()];

  if (filter?.institutionId) {
    list = list.filter((l) => !l.institutionId || l.institutionId === filter.institutionId);
  }
  if (filter?.actorRole) {
    list = list.filter((l) => l.actorRole === filter.actorRole);
  }
  if (filter?.resource) {
    list = list.filter((l) => l.resource === filter.resource);
  }
  if (filter?.action) {
    list = list.filter((l) => l.action === filter.action);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.actorEmail.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    );
  }

  return list;
}
