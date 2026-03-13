// Exactly mirrors Rust models with camelCase
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'text' | 'form-urlencoded' | 'form-data' | 'xml' | 'html';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface BearerConfig { token: string }
export interface BasicConfig { username: string; password: string }
export interface ApiKeyConfig { key: string; value: string; addTo: 'header' | 'query' }
export interface Oauth2Config { accessToken: string; tokenType: string; addTo: 'header' }

// Flat struct matching Rust AuthConfig
export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';
  bearer?: BearerConfig;
  basic?: BasicConfig;
  apiKey?: ApiKeyConfig;
  oauth2?: Oauth2Config;
}

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  auth: AuthConfig;
  bodyType: BodyType;
  bodyRaw: string;
  bodyFormPairs: KeyValuePair[];
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  sizeBytes: number;
}

// Collection types
export interface SavedRequest {
  id: string;
  name: string;
  request: RequestConfig;
}

export interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

// Environment types
export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

// History types
export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO 8601
  request: RequestConfig;
  response: HttpResponse;
}

// For Tauri append_history command — no id/timestamp (Rust assigns those)
export interface AppendHistoryPayload {
  request: RequestConfig;
  response: HttpResponse;
}

// Request tab (ephemeral UI state)
export interface RequestTab {
  id: string; // uuid, ephemeral only
  name: string;
  request: RequestConfig;
  response?: HttpResponse;
  isLoading: boolean;
  savedRequestId?: string; // if loaded from collection
}
