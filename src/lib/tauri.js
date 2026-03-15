import { invoke } from '@tauri-apps/api/core';
// Execute HTTP request
export async function executeRequest(config) {
    return invoke('execute_request', { config });
}
// Collections
export async function getCollections() {
    return invoke('get_collections');
}
export async function saveCollection(collection) {
    return invoke('save_collection', { collection });
}
export async function deleteCollection(id) {
    return invoke('delete_collection', { id });
}
export async function exportCollection(id) {
    return invoke('export_collection', { id });
}
export async function saveRequestToCollection(collectionId, request) {
    return invoke('save_request_to_collection', { collectionId, folderId: null, request });
}
export async function deleteRequestFromCollection(collectionId, requestId) {
    return invoke('delete_request_from_collection', { collectionId, folderId: null, requestId });
}
// Environments
export async function getEnvironments() {
    return invoke('get_environments');
}
export async function saveEnvironment(environment) {
    return invoke('save_environment', { environment });
}
export async function deleteEnvironment(id) {
    return invoke('delete_environment', { id });
}
// History
export async function getHistory() {
    return invoke('get_history');
}
export async function appendHistory(payload) {
    return invoke('append_history', { payload });
}
export async function clearHistory() {
    return invoke('clear_history');
}
