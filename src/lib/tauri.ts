import { invoke } from '@tauri-apps/api/core';
import type {
  RequestConfig,
  HttpResponse,
  Collection,
  SavedRequest,
  Environment,
  HistoryEntry,
  AppendHistoryPayload,
} from '../types';

// Execute HTTP request
export async function executeRequest(config: RequestConfig): Promise<HttpResponse> {
  return invoke<HttpResponse>('execute_request', { config });
}

// Collections
export async function getCollections(): Promise<Collection[]> {
  return invoke<Collection[]>('get_collections');
}

export async function saveCollection(collection: Collection): Promise<void> {
  return invoke<void>('save_collection', { collection });
}

export async function deleteCollection(id: string): Promise<void> {
  return invoke<void>('delete_collection', { id });
}

export async function exportCollection(id: string): Promise<void> {
  return invoke<void>('export_collection', { id });
}

export async function saveRequestToCollection(
  collectionId: string,
  request: SavedRequest,
): Promise<Collection> {
  return invoke<Collection>('save_request_to_collection', { collectionId, folderId: null, request });
}

export async function deleteRequestFromCollection(
  collectionId: string,
  requestId: string,
): Promise<Collection> {
  return invoke<Collection>('delete_request_from_collection', { collectionId, folderId: null, requestId });
}

// Environments
export async function getEnvironments(): Promise<Environment[]> {
  return invoke<Environment[]>('get_environments');
}

export async function saveEnvironment(environment: Environment): Promise<void> {
  return invoke<void>('save_environment', { environment });
}

export async function deleteEnvironment(id: string): Promise<void> {
  return invoke<void>('delete_environment', { id });
}

// History
export async function getHistory(): Promise<HistoryEntry[]> {
  return invoke<HistoryEntry[]>('get_history');
}

export async function appendHistory(payload: AppendHistoryPayload): Promise<HistoryEntry> {
  return invoke<HistoryEntry>('append_history', { payload });
}

export async function clearHistory(): Promise<void> {
  return invoke<void>('clear_history');
}
