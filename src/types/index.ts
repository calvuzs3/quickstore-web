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
