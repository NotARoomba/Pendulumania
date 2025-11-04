use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use core::ops;
use std::{f64::consts::PI, vec};
// extern crate console_error_panic_hook;
// use std::panic;

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone, PartialEq, Copy, Default)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64
}
#[wasm_bindgen]
impl Vec2 {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Self {
        Self {x, y}
    }
    pub fn divide(&mut self, n: f64) {
        self.x = self.x/n;
        self.y = self.y/n;
    }
    pub fn distance_from(&self, other: Vec2) -> f64 {
        f64::sqrt(f64::powi(self.x - other.x, 2) + f64::powi(self.y - other.y, 2))
    }
}
impl ops::Add for Vec2 {
    type Output = Vec2;
    fn add(self, rhs: Self) -> Self::Output {
        Vec2 {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}
impl ops::Sub for Vec2 {
    type Output = Vec2;
    fn sub(self, rhs: Self) -> Self::Output {
        Vec2 {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}
impl ops::AddAssign for Vec2 {
    fn add_assign(&mut self, other: Self) {
        *self = Self {
            x: self.x + other.x,
            y: self.y + other.y,
        };
    }
}
impl ops::DivAssign<f64> for Vec2 {
    fn div_assign(&mut self, d: f64) {
        self.x /= d;
        self.y /= d;
    }
}
impl ops::Mul<f64> for Vec2 {
    type Output = Self;
    fn mul(self, m: f64) -> Self {
        Self::new(self.x*m, self.y*m)
    }
}
impl ops::Div<f64> for Vec2 {
    type Output = Self;
    fn div(self, m: f64) -> Self {
        Self::new(self.x/m, self.y/m)
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, PartialEq, Clone, Copy)]
pub struct Rod {
    pub length: f64,
    pub mass: f64,
    pub color: u32,
}
#[wasm_bindgen]
impl Rod {
    #[wasm_bindgen(constructor)]
    pub fn new(length: f64, mass: f64, color: u32) -> Rod {
        Rod {length, mass, color}
    }
    pub fn update_length(&mut self, length: f64) {
        self.length = length;
    }
    pub fn get_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self).unwrap()
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct Trail {
    pub pos: Vec2,
    pub color: u32,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct Bob {
    pub pos: Vec2,
    pub omega: f64,
    pub theta: f64,
    pub rod: Rod,
    trail: Vec<Trail>,
    pub radius: i32,
    pub mass: f64,
    pub color: u32
}
#[wasm_bindgen]
impl Bob {
    #[wasm_bindgen(constructor)]
    pub fn new(px: f64, py: f64, omega: f64, theta: f64, rl: f64, rm: f64, rc: u32, radius: i32, mass: f64, color: u32) -> Bob {
        Bob {pos: Vec2::new(px, py), omega, theta, radius, mass, color, rod: Rod::new(rl, rm, rc), trail: vec![]}
    }

    pub fn get_trail(&self) -> Vec<Trail> {
        self.trail.clone()
    }

    pub fn add_trail_point(&mut self, pos: Vec2, color: u32, max: usize) {
        self.trail.push(Trail {pos, color});
        if self.trail.len() > max {
            self.trail.remove(0);
        }
    }

    pub fn get_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self).unwrap()
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum IntegrationMethod {
    Euler, // only 2nd order for now
    RK4,
    Hamiltonian,
}



#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct Universe {
    bobs: Vec<Bob>,
    gravity: f64,
    is_paused: bool,
    integration_method: IntegrationMethod,
    speed: f64,
    step: f64,
    max_bobs: usize,
}
#[wasm_bindgen]
impl Universe  {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Universe {
        // panic::set_hook(Box::new(console_error_panic_hook::hook));
        // wasm_logger::init(wasm_logger::Config::default());
        // log::info!("Universe Init!");
        //  self.x_1 = self.origin_x + self.length_rod_1 * math.sin(self.theta_1)
        // self.y_1 = self.origin_y + self.length_rod_1 * math.cos(self.theta_1)
        // self.x_2 = self.x_1 + self.length_rod_2 * math.sin(self.theta_2)
        // self.y_2 = self.y_1 + self.length_rod_2 * math.cos(self.theta_2)
        let bob1 = Bob::new(100.0, 0.0, 0.0, PI/2.0, 100.0, 10.0, 0x0f0f0f, 10, 100.0, 0xFF0000);
        let bob2 = Bob::new(200.0, 0.0, 0.0, PI/2.0, 100.0, 10.0, 0x0f0f0f, 10, 100.0, 0x0000FF);
        Universe {bobs: vec![bob1, bob2], gravity: 9.8, integration_method: IntegrationMethod::Euler, speed: 1.0/20.0, step: 0.1, max_bobs: 2, is_paused: false}
    }
    pub fn time_step(&mut self, dt: f64) -> u8 {
        if self.bobs.is_empty() || self.is_paused {
            return 1;
        }

        if self.bobs.len() > self.max_bobs {
            // cutoff for Euler method, remove extras
            self.bobs.truncate(self.max_bobs);
        }

        if self.integration_method == IntegrationMethod::Euler {
            // Simple Euler integration for demonstration
            let delta = self.bobs[1].theta - self.bobs[0].theta;

        let denominator_1 = (self.bobs[0].mass + self.bobs[1].mass) * self.bobs[0].rod.length - self.bobs[1].mass * self.bobs[0].rod.length * f64::powi(f64::cos(delta), 2);
        let denominator_2 = (self.bobs[1].rod.length / self.bobs[0].rod.length) * denominator_1;

        let acceleration_1 = (self.bobs[1].mass * self.bobs[0].rod.length * f64::powi(self.bobs[0].omega, 2) * f64::sin(delta) * f64::cos(delta) +
              self.bobs[1].mass * self.gravity * f64::sin(self.bobs[1].theta) * f64::cos(delta) +
              self.bobs[1].mass * self.bobs[1].rod.length * f64::powi(self.bobs[1].omega, 2) * f64::sin(delta) -
              (self.bobs[0].mass + self.bobs[1].mass) * self.gravity * f64::sin(self.bobs[0].theta)) / denominator_1;

        let acceleration_2 = (-self.bobs[1].mass * self.bobs[1].rod.length * f64::powi(self.bobs[1].omega, 2) * f64::sin(delta) * f64::cos(delta) +
              (self.bobs[0].mass + self.bobs[1].mass) * self.gravity * f64::sin(self.bobs[0].theta) * f64::cos(delta) -
              (self.bobs[0].mass + self.bobs[1].mass) * self.bobs[0].rod.length * f64::powi(self.bobs[0].omega, 2) * f64::sin(delta) -
              (self.bobs[0].mass + self.bobs[1].mass) * self.gravity * f64::sin(self.bobs[1].theta)) / denominator_2;
        let new_dt = dt * self.speed;
        self.bobs[0].omega += acceleration_1 * new_dt;
        self.bobs[1].omega += acceleration_2 * new_dt;
        self.bobs[0].theta += self.bobs[0].omega * new_dt;
        self.bobs[1].theta += self.bobs[1].omega * new_dt;

        let pos_0 = self.bobs[0].pos;
        let pos_1 = self.bobs[1].pos;
        let color_1 = self.bobs[0].color;
        let color_2 = self.bobs[1].color;

        self.bobs[0].add_trail_point(pos_0, color_1, 1000);
        self.bobs[1].add_trail_point(pos_1, color_2, 1000);

       self.bobs[0].pos.x = self.bobs[0].rod.length * f64::sin(self.bobs[0].theta);
       self.bobs[0].pos.y = self.bobs[0].rod.length * f64::cos(self.bobs[0].theta);
       self.bobs[1].pos.x = self.bobs[0].pos.x + self.bobs[1].rod.length * f64::sin(self.bobs[1].theta);
       self.bobs[1].pos.y = self.bobs[0].pos.y + self.bobs[1].rod.length * f64::cos(self.bobs[1].theta);

        } else if self.integration_method == IntegrationMethod::Hamiltonian {
            // Placeholder for Matrix method
        } else if self.integration_method == IntegrationMethod::RK4 {
            // Placeholder for RK4 method
        }

        return 0;

    }
    pub fn reset(&mut self) {
        *self = Universe::new();
    }
    pub fn add_bob(&mut self, px: f64, py: f64, omega: f64, theta: f64, rl: f64, rm: f64, rc: u32, radius: i32, mass: f64, color: u32) {
        self.bobs.push(Bob::new(px, py, omega, theta, rl, rm, rc, radius, mass, color));
    }
    pub fn remove_bob(&mut self) {
        self.bobs.pop();
    }
    pub fn get_bobs(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.bobs).unwrap()
    }
    
    pub fn get_bob(&self, index: usize) -> Option<Bob> {
        self.bobs.get(index).cloned()
    }
    pub fn get_bob_count(&self) -> i32 {
        self.bobs.len() as i32
    }

    pub fn get_trails(&self) -> JsValue {
        let trails: Vec<Vec<Trail>> = self.bobs.iter().map(|bob| bob.trail.clone()).collect();
        serde_wasm_bindgen::to_value(&trails).unwrap()
    }
    pub fn set_gravity(&mut self, gravity: f64) {
        self.gravity = gravity;
    }
    pub fn get_gravity(&self) -> f64 {
        return self.gravity;
    }
    pub fn set_speed(&mut self, speed: f64) {
        self.speed = speed;
    }
    pub fn get_speed(&self) -> f64 {
        return self.speed;
    }
    
    pub fn set_is_paused(&mut self, is_paused: bool) {
        self.is_paused = is_paused;
    }

    pub fn get_is_paused(&self) -> bool {
        return self.is_paused;
    }

    pub fn set_integration_method(&mut self, integration_method: IntegrationMethod) {
        self.integration_method = integration_method;
        if integration_method == IntegrationMethod::Euler {
            self.max_bobs = 2;
        } else {
            self.max_bobs = 1000;
        }
    }
    pub fn get_integration_method(&self) -> IntegrationMethod {
        return self.integration_method;
    }
}
 
