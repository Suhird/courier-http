#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    courier_http_lib::run();
}
