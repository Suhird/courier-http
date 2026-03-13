use crate::models::{request::RequestConfig, response::HttpResponse};
use base64::{engine::general_purpose::STANDARD, Engine};
use std::time::Instant;


#[tauri::command]
pub async fn execute_request(config: RequestConfig) -> Result<HttpResponse, String> {
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(&config.url).map_err(|e| format!("Invalid URL: {e}"))?;
    {
        let mut pairs = url.query_pairs_mut();
        for p in config.params.iter().filter(|p| p.enabled && !p.key.is_empty()) {
            pairs.append_pair(&p.key, &p.value);
        }
    }

    if config.auth.r#type == "api-key" {
        if let Some(ak) = &config.auth.api_key {
            if ak.add_to == "query" {
                url.query_pairs_mut().append_pair(&ak.key, &ak.value);
            }
        }
    }

    let method = reqwest::Method::from_bytes(config.method.as_bytes())
        .map_err(|e| format!("Invalid method: {e}"))?;

    let mut req = client.request(method, url);

    for h in config.headers.iter().filter(|h| h.enabled && !h.key.is_empty()) {
        req = req.header(&h.key, &h.value);
    }

    req = match config.auth.r#type.as_str() {
        "bearer" => {
            if let Some(b) = &config.auth.bearer {
                req.header("Authorization", format!("Bearer {}", b.token))
            } else { req }
        }
        "basic" => {
            if let Some(b) = &config.auth.basic {
                let encoded = STANDARD.encode(format!("{}:{}", b.username, b.password));
                req.header("Authorization", format!("Basic {encoded}"))
            } else { req }
        }
        "api-key" => {
            if let Some(ak) = &config.auth.api_key {
                if ak.add_to == "header" {
                    req.header(ak.key.as_str(), ak.value.as_str())
                } else { req }
            } else { req }
        }
        "oauth2" => {
            if let Some(o) = &config.auth.oauth2 {
                req.header("Authorization", format!("{} {}", o.token_type, o.access_token))
            } else { req }
        }
        _ => req,
    };

    req = match config.body_type.as_str() {
        "json" => req
            .header("Content-Type", "application/json")
            .body(config.body_raw.clone()),
        "raw" => req.body(config.body_raw.clone()),
        "form-urlencoded" => {
            let pairs: Vec<(String, String)> = config
                .body_form_pairs
                .iter()
                .filter(|p| p.enabled)
                .map(|p| (p.key.clone(), p.value.clone()))
                .collect();
            req.form(&pairs)
        }
        "form-data" => {
            let mut form = reqwest::multipart::Form::new();
            for p in config.body_form_pairs.iter().filter(|p| p.enabled) {
                form = form.text(p.key.clone(), p.value.clone());
            }
            req.multipart(form)
        }
        _ => req,
    };

    let start = Instant::now();
    let resp = req.send().await.map_err(|e| format!("Request failed: {e}"))?;
    let duration_ms = start.elapsed().as_millis();

    let status = resp.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_string();
    let headers: std::collections::HashMap<String, String> = resp
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    let body_bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    let size_bytes = body_bytes.len();
    let body = String::from_utf8(body_bytes.to_vec())
        .unwrap_or_else(|_| STANDARD.encode(&body_bytes));

    Ok(HttpResponse {
        status: status.as_u16(),
        status_text,
        headers,
        body,
        duration_ms,
        size_bytes,
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{ApiKeyConfig, AuthConfig, BasicConfig, BearerConfig, KeyValuePair, RequestConfig};

    fn none_auth() -> AuthConfig {
        AuthConfig {
            r#type: "none".to_string(),
            bearer: None,
            basic: None,
            api_key: None,
            oauth2: None,
        }
    }

    fn make_config(url: &str) -> RequestConfig {
        RequestConfig {
            method: "GET".to_string(),
            url: url.to_string(),
            params: vec![],
            headers: vec![],
            auth: none_auth(),
            body_type: "none".to_string(),
            body_raw: String::new(),
            body_form_pairs: vec![],
        }
    }

    // ---- Unit tests ----

    #[tokio::test]
    async fn test_invalid_url_returns_error() {
        let config = make_config("not-a-url");
        let result = execute_request(config).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid URL"));
    }

    #[test]
    fn test_basic_auth_encoding() {
        let encoded = STANDARD.encode("user:password");
        assert_eq!(encoded, "dXNlcjpwYXNzd29yZA==");
        let encoded2 = STANDARD.encode("admin:");
        assert_eq!(encoded2, "YWRtaW46");
    }

    // ---- Integration tests using wiremock ----

    use wiremock::matchers::{header, method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    #[tokio::test]
    async fn test_execute_get_request() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/test"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_string(r#"{"ok":true}"#)
                    .insert_header("content-type", "application/json"),
            )
            .mount(&server)
            .await;

        let config = make_config(&format!("{}/test", server.uri()));
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
        assert_eq!(result.status_text, "OK");
        assert!(result.body.contains("ok"));
        assert!(result.duration_ms < 5000);
        assert!(result.size_bytes > 0);
    }

    #[tokio::test]
    async fn test_execute_returns_404() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/missing"))
            .respond_with(ResponseTemplate::new(404).set_body_string("Not Found"))
            .mount(&server)
            .await;

        let config = make_config(&format!("{}/missing", server.uri()));
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 404);
    }

    #[tokio::test]
    async fn test_query_params_appended() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/search"))
            .and(query_param("q", "rust"))
            .respond_with(ResponseTemplate::new(200).set_body_string("[]"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/search", server.uri()));
        config.params = vec![KeyValuePair {
            id: "1".to_string(),
            key: "q".to_string(),
            value: "rust".to_string(),
            enabled: true,
            description: None,
        }];
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_disabled_params_not_sent() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/api"))
            .respond_with(ResponseTemplate::new(200).set_body_string("ok"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/api", server.uri()));
        config.params = vec![KeyValuePair {
            id: "1".to_string(),
            key: "secret".to_string(),
            value: "value".to_string(),
            enabled: false,
            description: None,
        }];
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
        // Verify the disabled "secret" param was NOT sent as a query parameter.
        // Note: the url crate may leave an empty "?" on the URL even with no pairs
        // appended, so we check that the key is absent rather than query() being None.
        let received = server.received_requests().await.unwrap();
        assert_eq!(received.len(), 1);
        let query = received[0].url.query().unwrap_or("");
        assert!(!query.contains("secret"));
    }

    #[tokio::test]
    async fn test_bearer_auth_header() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/protected"))
            .and(header("Authorization", "Bearer my-token"))
            .respond_with(ResponseTemplate::new(200).set_body_string("secret"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/protected", server.uri()));
        config.auth = AuthConfig {
            r#type: "bearer".to_string(),
            bearer: Some(BearerConfig { token: "my-token".to_string() }),
            basic: None,
            api_key: None,
            oauth2: None,
        };
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_basic_auth_header() {
        let expected = format!("Basic {}", STANDARD.encode("admin:pass"));

        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/secure"))
            .and(header("Authorization", expected.as_str()))
            .respond_with(ResponseTemplate::new(200).set_body_string("ok"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/secure", server.uri()));
        config.auth = AuthConfig {
            r#type: "basic".to_string(),
            bearer: None,
            basic: Some(BasicConfig {
                username: "admin".to_string(),
                password: "pass".to_string(),
            }),
            api_key: None,
            oauth2: None,
        };
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_api_key_in_header() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/data"))
            .and(header("X-API-Key", "abc123"))
            .respond_with(ResponseTemplate::new(200).set_body_string("data"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/data", server.uri()));
        config.auth = AuthConfig {
            r#type: "api-key".to_string(),
            bearer: None,
            basic: None,
            api_key: Some(ApiKeyConfig {
                key: "X-API-Key".to_string(),
                value: "abc123".to_string(),
                add_to: "header".to_string(),
            }),
            oauth2: None,
        };
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_api_key_in_query() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/data"))
            .and(query_param("apikey", "secret"))
            .respond_with(ResponseTemplate::new(200).set_body_string("ok"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/data", server.uri()));
        config.auth = AuthConfig {
            r#type: "api-key".to_string(),
            bearer: None,
            basic: None,
            api_key: Some(ApiKeyConfig {
                key: "apikey".to_string(),
                value: "secret".to_string(),
                add_to: "query".to_string(),
            }),
            oauth2: None,
        };
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_oauth2_auth_header() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/oauth"))
            .and(header("Authorization", "Bearer oauth-access-token"))
            .respond_with(ResponseTemplate::new(200).set_body_string("ok"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/oauth", server.uri()));
        config.auth = AuthConfig {
            r#type: "oauth2".to_string(),
            bearer: None,
            basic: None,
            api_key: None,
            oauth2: Some(crate::models::request::Oauth2Config {
                access_token: "oauth-access-token".to_string(),
                token_type: "Bearer".to_string(),
                add_to: "header".to_string(),
            }),
        };
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn test_post_json_body() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/create"))
            .and(header("content-type", "application/json"))
            .respond_with(ResponseTemplate::new(201).set_body_string(r#"{"id":1}"#))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/create", server.uri()));
        config.method = "POST".to_string();
        config.body_type = "json".to_string();
        config.body_raw = r#"{"name":"test"}"#.to_string();
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 201);
    }

    #[tokio::test]
    async fn test_response_headers_captured() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/headers"))
            .respond_with(
                ResponseTemplate::new(200)
                    .insert_header("x-custom-header", "hello")
                    .set_body_string("ok"),
            )
            .mount(&server)
            .await;

        let config = make_config(&format!("{}/headers", server.uri()));
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
        assert!(result.headers.contains_key("x-custom-header"));
        assert_eq!(result.headers["x-custom-header"], "hello");
    }

    #[tokio::test]
    async fn test_custom_request_headers_sent() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/req-headers"))
            .and(header("X-Request-Id", "42"))
            .respond_with(ResponseTemplate::new(200).set_body_string("ok"))
            .mount(&server)
            .await;

        let mut config = make_config(&format!("{}/req-headers", server.uri()));
        config.headers = vec![KeyValuePair {
            id: "h1".to_string(),
            key: "X-Request-Id".to_string(),
            value: "42".to_string(),
            enabled: true,
            description: None,
        }];
        let result = execute_request(config).await.unwrap();
        assert_eq!(result.status, 200);
    }
}
