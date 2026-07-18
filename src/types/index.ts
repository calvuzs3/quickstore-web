// Rispecchiati a mano da quickstore-shared/src/commonMain/kotlin/net/calvuz/qstore/shared/dto/AuthDto.kt
// (Kotlin Multiplatform, non consumabile direttamente da TypeScript — vedi CLAUDE.md
// del piano di scaffolding: nessuna pipeline di codegen Kotlin->TS pianificata).

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  roleLevel: number;
  roleCode: string;
}

/** Risposta quando l'utente ha una sola org (o dopo /auth/select-org): token pieno. */
export interface LoginResponse {
  token: string;
  orgId: string;
  orgName: string;
  roleLevel: number;
  roleCode: string;
}

/** Risposta quando l'utente ha più org: serve /auth/select-org prima del token pieno. */
export interface LoginOrgChoiceResponse {
  pendingToken: string;
  organizations: OrganizationSummary[];
}

export interface SelectOrgRequest {
  orgId: string;
}

/** Rispecchia ArticleSummaryDto/ArticleListResponse in ArticleListDto.kt (quickstore-shared). */
export interface ArticleSummary {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasure: string;
  codeOem: string;
  codeErp: string;
  codeBm: string;
  reorderLevel: number;
  totalQuantity: number;
}

export interface ArticleListResponse {
  items: ArticleSummary[];
  total: number;
}

/** Rispecchia MembershipDto/InviteMembershipRequest/UpdateMembershipRoleRequest in MembershipDto.kt. */
export interface Membership {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  roleLevel: number;
  roleCode: string;
}

export interface InviteMembershipRequest {
  email: string;
  roleLevel: number;
}

export interface UpdateMembershipRoleRequest {
  roleLevel: number;
}

// I tre ruoli noti in tutto il progetto (Android, server) — nessun endpoint da cui
// leggerli dinamicamente, vedi roles table in quickstore-server/migrations/V001__init.sql.
export const MEMBERSHIP_ROLES: { level: number; code: string; label: string }[] = [
  { level: 0, code: "GUEST", label: "Guest" },
  { level: 5, code: "OPERATOR", label: "Operatore" },
  { level: 9, code: "ADMIN", label: "Admin" },
];

/** Rispecchia CreateUserRequest/UserDto in UserAdminDto.kt (quickstore-shared). */
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserAdmin {
  id: string;
  email: string;
  displayName: string | null;
}
