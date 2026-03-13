use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KeyValuePair {
    pub id: String,
    pub key: String,
    pub value: String,
    pub enabled: bool,
    pub description: Option<String>,
}

// Matches the TypeScript flat AuthConfig shape:
// { type: "bearer", bearer: { token: "..." } }
// { type: "api-key", apiKey: { key: "...", value: "...", addTo: "header"|"query" } }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BearerConfig { pub token: String }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BasicConfig { pub username: String, pub password: String }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyConfig { pub key: String, pub value: String, pub add_to: String }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Oauth2Config { pub access_token: String, pub token_type: String, pub add_to: String }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AuthConfig {
    pub r#type: String,
    pub bearer: Option<BearerConfig>,
    pub basic: Option<BasicConfig>,
    pub api_key: Option<ApiKeyConfig>,
    pub oauth2: Option<Oauth2Config>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestConfig {
    pub method: String,
    pub url: String,
    pub params: Vec<KeyValuePair>,
    pub headers: Vec<KeyValuePair>,
    pub auth: AuthConfig,
    pub body_type: String,
    pub body_raw: String,
    pub body_form_pairs: Vec<KeyValuePair>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppendHistoryPayload {
    pub request: RequestConfig,
    pub response: crate::models::response::HttpResponse,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ---- KeyValuePair ----

    #[test]
    fn test_key_value_pair_roundtrip() {
        let kv = KeyValuePair {
            id: "1".to_string(),
            key: "Content-Type".to_string(),
            value: "application/json".to_string(),
            enabled: true,
            description: Some("a header".to_string()),
        };
        let json = serde_json::to_string(&kv).unwrap();
        let back: KeyValuePair = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, kv.id);
        assert_eq!(back.key, kv.key);
        assert_eq!(back.value, kv.value);
        assert_eq!(back.enabled, kv.enabled);
        assert_eq!(back.description, kv.description);
    }

    #[test]
    fn test_key_value_pair_json_keys_are_camel_case() {
        let kv = KeyValuePair {
            id: "42".to_string(),
            key: "X-Token".to_string(),
            value: "abc".to_string(),
            enabled: false,
            description: None,
        };
        let json = serde_json::to_string(&kv).unwrap();
        // All fields are already camelCase (single-word), verify they appear
        assert!(json.contains("\"id\""));
        assert!(json.contains("\"key\""));
        assert!(json.contains("\"value\""));
        assert!(json.contains("\"enabled\""));
        assert!(json.contains("\"description\""));
    }

    #[test]
    fn test_key_value_pair_description_none_serializes() {
        let kv = KeyValuePair {
            id: "1".to_string(),
            key: "k".to_string(),
            value: "v".to_string(),
            enabled: true,
            description: None,
        };
        let json = serde_json::to_string(&kv).unwrap();
        // description is Option<String> — serde default serializes None as null
        assert!(json.contains("\"description\":null"));
    }

    // ---- AuthConfig variants ----

    #[test]
    fn test_auth_config_none_variant() {
        let auth = AuthConfig {
            r#type: "none".to_string(),
            bearer: None,
            basic: None,
            api_key: None,
            oauth2: None,
        };
        let json = serde_json::to_string(&auth).unwrap();
        let back: AuthConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(back.r#type, "none");
        assert!(back.bearer.is_none());
        assert!(back.basic.is_none());
        assert!(back.api_key.is_none());
        assert!(back.oauth2.is_none());
    }

    #[test]
    fn test_auth_config_bearer_variant() {
        let auth = AuthConfig {
            r#type: "bearer".to_string(),
            bearer: Some(BearerConfig { token: "tok123".to_string() }),
            basic: None,
            api_key: None,
            oauth2: None,
        };
        let json = serde_json::to_string(&auth).unwrap();
        // bearer field must be present with token
        assert!(json.contains("\"bearer\""));
        assert!(json.contains("tok123"));
        // api_key → serializes as "apiKey" (camelCase)
        assert!(json.contains("\"apiKey\""));
        // None api_key must serialize as null (not absent), confirm no non-null apiKey value
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(v["apiKey"].is_null());
        let back: AuthConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(back.r#type, "bearer");
        assert_eq!(back.bearer.as_ref().unwrap().token, "tok123");
        assert!(back.api_key.is_none());
    }

    #[test]
    fn test_auth_config_basic_variant() {
        let auth = AuthConfig {
            r#type: "basic".to_string(),
            bearer: None,
            basic: Some(BasicConfig {
                username: "admin".to_string(),
                password: "secret".to_string(),
            }),
            api_key: None,
            oauth2: None,
        };
        let json = serde_json::to_string(&auth).unwrap();
        let back: AuthConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(back.r#type, "basic");
        let basic = back.basic.unwrap();
        assert_eq!(basic.username, "admin");
        assert_eq!(basic.password, "secret");
    }

    #[test]
    fn test_auth_config_api_key_variant_camel_case() {
        let auth = AuthConfig {
            r#type: "api-key".to_string(),
            bearer: None,
            basic: None,
            api_key: Some(ApiKeyConfig {
                key: "X-API-Key".to_string(),
                value: "mykey".to_string(),
                add_to: "header".to_string(),
            }),
            oauth2: None,
        };
        let json = serde_json::to_string(&auth).unwrap();
        // Rust field api_key must serialize as "apiKey"
        assert!(json.contains("\"apiKey\""));
        // add_to must serialize as "addTo"
        assert!(json.contains("\"addTo\""));
        assert!(json.contains("header"));
        let back: AuthConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(back.r#type, "api-key");
        let ak = back.api_key.unwrap();
        assert_eq!(ak.key, "X-API-Key");
        assert_eq!(ak.value, "mykey");
        assert_eq!(ak.add_to, "header");
    }

    #[test]
    fn test_auth_config_oauth2_variant() {
        let auth = AuthConfig {
            r#type: "oauth2".to_string(),
            bearer: None,
            basic: None,
            api_key: None,
            oauth2: Some(Oauth2Config {
                access_token: "tokenvalue".to_string(),
                token_type: "Bearer".to_string(),
                add_to: "header".to_string(),
            }),
        };
        let json = serde_json::to_string(&auth).unwrap();
        // access_token → "accessToken", token_type → "tokenType", add_to → "addTo"
        assert!(json.contains("\"accessToken\""));
        assert!(json.contains("\"tokenType\""));
        assert!(json.contains("\"addTo\""));
        let back: AuthConfig = serde_json::from_str(&json).unwrap();
        let o = back.oauth2.unwrap();
        assert_eq!(o.access_token, "tokenvalue");
        assert_eq!(o.token_type, "Bearer");
        assert_eq!(o.add_to, "header");
    }

    // ---- RequestConfig ----

    fn make_auth_none() -> AuthConfig {
        AuthConfig {
            r#type: "none".to_string(),
            bearer: None,
            basic: None,
            api_key: None,
            oauth2: None,
        }
    }

    #[test]
    fn test_request_config_full_roundtrip() {
        let config = RequestConfig {
            method: "POST".to_string(),
            url: "https://api.example.com/v1/resource".to_string(),
            params: vec![KeyValuePair {
                id: "p1".to_string(),
                key: "page".to_string(),
                value: "2".to_string(),
                enabled: true,
                description: None,
            }],
            headers: vec![KeyValuePair {
                id: "h1".to_string(),
                key: "Accept".to_string(),
                value: "application/json".to_string(),
                enabled: true,
                description: Some("accept header".to_string()),
            }],
            auth: make_auth_none(),
            body_type: "json".to_string(),
            body_raw: r#"{"name":"test"}"#.to_string(),
            body_form_pairs: vec![],
        };
        let json = serde_json::to_string(&config).unwrap();
        // Verify camelCase field names
        assert!(json.contains("\"bodyType\""));
        assert!(json.contains("\"bodyRaw\""));
        assert!(json.contains("\"bodyFormPairs\""));
        let back: RequestConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(back.method, "POST");
        assert_eq!(back.url, "https://api.example.com/v1/resource");
        assert_eq!(back.params.len(), 1);
        assert_eq!(back.params[0].key, "page");
        assert_eq!(back.headers.len(), 1);
        assert_eq!(back.headers[0].key, "Accept");
        assert_eq!(back.body_type, "json");
        assert_eq!(back.body_raw, r#"{"name":"test"}"#);
        assert!(back.body_form_pairs.is_empty());
    }

    #[test]
    fn test_request_config_body_fields_camel_case() {
        let config = RequestConfig {
            method: "GET".to_string(),
            url: "https://example.com".to_string(),
            params: vec![],
            headers: vec![],
            auth: make_auth_none(),
            body_type: "form-urlencoded".to_string(),
            body_raw: String::new(),
            body_form_pairs: vec![KeyValuePair {
                id: "f1".to_string(),
                key: "field".to_string(),
                value: "val".to_string(),
                enabled: true,
                description: None,
            }],
        };
        let json = serde_json::to_string(&config).unwrap();
        assert!(json.contains("\"bodyType\""));
        assert!(json.contains("\"bodyRaw\""));
        assert!(json.contains("\"bodyFormPairs\""));
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["bodyType"], "form-urlencoded");
        assert!(v["bodyFormPairs"].is_array());
        assert_eq!(v["bodyFormPairs"].as_array().unwrap().len(), 1);
    }
}
