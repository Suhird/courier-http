use serde::{Deserialize, Serialize};
use crate::models::request::RequestConfig;


#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedRequest {
    pub id: String,
    pub name: String,
    pub request: RequestConfig,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CollectionFolder {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub requests: Vec<SavedRequest>,
    #[serde(default)]
    pub folders: Vec<CollectionFolder>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub folders: Vec<CollectionFolder>,
    #[serde(default)]
    pub requests: Vec<SavedRequest>,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{AuthConfig, RequestConfig};

    fn make_request_config() -> RequestConfig {
        RequestConfig {
            method: "GET".to_string(),
            url: "https://example.com".to_string(),
            params: vec![],
            headers: vec![],
            auth: AuthConfig {
                r#type: "none".to_string(),
                bearer: None,
                basic: None,
                api_key: None,
                oauth2: None,
            },
            body_type: "none".to_string(),
            body_raw: String::new(),
            body_form_pairs: vec![],
        }
    }

    fn make_saved_request(id: &str, name: &str) -> SavedRequest {
        SavedRequest {
            id: id.to_string(),
            name: name.to_string(),
            request: make_request_config(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-06-01T12:00:00Z".to_string(),
        }
    }

    // ---- Collection ----

    #[test]
    fn test_collection_roundtrip_empty() {
        let col = Collection {
            id: "col-1".to_string(),
            name: "My API".to_string(),
            description: Some("test collection".to_string()),
            folders: vec![],
            requests: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-06-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&col).unwrap();
        let back: Collection = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "col-1");
        assert_eq!(back.name, "My API");
        assert_eq!(back.description, Some("test collection".to_string()));
        assert!(back.folders.is_empty());
        assert!(back.requests.is_empty());
        assert_eq!(back.created_at, "2024-01-01T00:00:00Z");
        assert_eq!(back.updated_at, "2024-06-01T00:00:00Z");
    }

    #[test]
    fn test_collection_camel_case_timestamps() {
        let col = Collection {
            id: "c1".to_string(),
            name: "Test".to_string(),
            description: None,
            folders: vec![],
            requests: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&col).unwrap();
        assert!(json.contains("\"createdAt\""));
        assert!(json.contains("\"updatedAt\""));
        assert!(!json.contains("\"created_at\""));
        assert!(!json.contains("\"updated_at\""));
    }

    #[test]
    fn test_collection_with_nested_folder() {
        let inner_folder = CollectionFolder {
            id: "f-inner".to_string(),
            name: "Inner".to_string(),
            requests: vec![make_saved_request("r-inner", "Inner Request")],
            folders: vec![],
        };
        let outer_folder = CollectionFolder {
            id: "f-outer".to_string(),
            name: "Outer".to_string(),
            requests: vec![],
            folders: vec![inner_folder],
        };
        let col = Collection {
            id: "col-nested".to_string(),
            name: "Nested".to_string(),
            description: None,
            folders: vec![outer_folder],
            requests: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&col).unwrap();
        let back: Collection = serde_json::from_str(&json).unwrap();
        assert_eq!(back.folders.len(), 1);
        let outer = &back.folders[0];
        assert_eq!(outer.id, "f-outer");
        assert_eq!(outer.folders.len(), 1);
        let inner = &outer.folders[0];
        assert_eq!(inner.id, "f-inner");
        assert_eq!(inner.requests.len(), 1);
        assert_eq!(inner.requests[0].id, "r-inner");
    }

    // ---- SavedRequest ----

    #[test]
    fn test_saved_request_roundtrip() {
        let sr = make_saved_request("sr-1", "Get Users");
        let json = serde_json::to_string(&sr).unwrap();
        // Verify camelCase timestamp fields
        assert!(json.contains("\"createdAt\""));
        assert!(json.contains("\"updatedAt\""));
        let back: SavedRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "sr-1");
        assert_eq!(back.name, "Get Users");
        assert_eq!(back.created_at, "2024-01-01T00:00:00Z");
        assert_eq!(back.updated_at, "2024-06-01T12:00:00Z");
    }

    // ---- CollectionFolder ----

    #[test]
    fn test_collection_folder_recursive_roundtrip() {
        let deep = CollectionFolder {
            id: "deep".to_string(),
            name: "Deep".to_string(),
            requests: vec![make_saved_request("r-deep", "Deep Request")],
            folders: vec![],
        };
        let mid = CollectionFolder {
            id: "mid".to_string(),
            name: "Middle".to_string(),
            requests: vec![],
            folders: vec![deep],
        };
        let root = CollectionFolder {
            id: "root".to_string(),
            name: "Root".to_string(),
            requests: vec![make_saved_request("r-root", "Root Request")],
            folders: vec![mid],
        };
        let json = serde_json::to_string(&root).unwrap();
        let back: CollectionFolder = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "root");
        assert_eq!(back.requests.len(), 1);
        assert_eq!(back.folders.len(), 1);
        let mid_back = &back.folders[0];
        assert_eq!(mid_back.id, "mid");
        assert!(mid_back.requests.is_empty());
        let deep_back = &mid_back.folders[0];
        assert_eq!(deep_back.id, "deep");
        assert_eq!(deep_back.requests.len(), 1);
        assert_eq!(deep_back.requests[0].id, "r-deep");
    }
}
