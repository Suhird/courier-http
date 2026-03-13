mod commands;
mod models;
mod storage;

#[cfg(debug_assertions)]
#[tauri::command]
fn open_devtools(window: tauri::WebviewWindow) {
    window.open_devtools();
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::http::execute_request,
            commands::collections::get_collections,
            commands::collections::save_collection,
            commands::collections::delete_collection,
            commands::collections::export_collection,
            commands::collections::save_request_to_collection,
            commands::collections::delete_request_from_collection,
            commands::environments::get_environments,
            commands::environments::save_environment,
            commands::environments::delete_environment,
            commands::history::get_history,
            commands::history::append_history,
            commands::history::clear_history,
            #[cfg(debug_assertions)]
            open_devtools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
