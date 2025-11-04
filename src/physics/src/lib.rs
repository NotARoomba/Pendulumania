use rand::Rng;
use wasm_bindgen::prelude::*;
use serde::{ Serialize, Deserialize };
use core::ops;
use std::{ f64::consts::PI, vec };
use nalgebra::{ DMatrix, DVector, LU };
// extern crate console_error_panic_hook;
// use std::panic;

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone, PartialEq, Copy, Default)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}
#[wasm_bindgen]
impl Vec2 {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
    pub fn divide(&mut self, n: f64) {
        self.x = self.x / n;
        self.y = self.y / n;
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
        Self::new(self.x * m, self.y * m)
    }
}
impl ops::Div<f64> for Vec2 {
    type Output = Self;
    fn div(self, m: f64) -> Self {
        Self::new(self.x / m, self.y / m)
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
        Rod { length, mass, color }
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
    pub color: u32,
}
#[wasm_bindgen]
impl Bob {
    #[wasm_bindgen(constructor)]
    pub fn new(
        px: f64,
        py: f64,
        omega: f64,
        theta: f64,
        rl: f64,
        rm: f64,
        rc: u32,
        radius: i32,
        mass: f64,
        color: u32
    ) -> Bob {
        Bob {
            pos: Vec2::new(px, py),
            omega,
            theta,
            radius,
            mass,
            color,
            rod: Rod::new(rl, rm, rc),
            trail: vec![],
        }
    }

    pub fn get_trail(&self) -> Vec<Trail> {
        self.trail.clone()
    }

    pub fn add_trail_point(&mut self, pos: Vec2, color: u32, max: usize) {
        self.trail.push(Trail { pos, color });
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
pub enum Implementation {
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
    implementation: Implementation,
    speed: f64,
    step: f64,
    max_bobs: usize,
}
#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Universe {
        // panic::set_hook(Box::new(console_error_panic_hook::hook));
        // wasm_logger::init(wasm_logger::Config::default());
        // log::info!("Universe Init!");
        //  self.x_1 = self.origin_x + self.length_rod_1 * math.sin(self.theta_1)
        // self.y_1 = self.origin_y + self.length_rod_1 * math.cos(self.theta_1)
        // self.x_2 = self.x_1 + self.length_rod_2 * math.sin(self.theta_2)
        // self.y_2 = self.y_1 + self.length_rod_2 * math.cos(self.theta_2)
        let bob1 = Bob::new(100.0, 0.0, 0.0, PI / 2.0, 100.0, 10.0, 0x0f0f0f, 10, 100.0, 0xff0000);
        let bob2 = Bob::new(200.0, 0.0, 0.0, PI / 2.0, 100.0, 10.0, 0x0f0f0f, 10, 100.0, 0x0000ff);
        Universe {
            bobs: vec![bob1, bob2],
            gravity: 9.8,
            implementation: Implementation::Euler,
            speed: 1.0 / 20.0,
            step: 0.1,
            max_bobs: 100,
            is_paused: false,
        }
    }
    pub fn time_step(&mut self, dt: f64) -> u8 {
        if self.bobs.is_empty() || self.is_paused {
            return 1;
        }

        if self.bobs.len() > self.max_bobs {
            // cutoff for Euler method, remove extras
            self.bobs.truncate(self.max_bobs);
        }
        let new_dt = dt * self.speed * 0.25;
        if self.implementation == Implementation::Euler {
            let thetas: DVector<f64> = DVector::from_iterator(
                self.bobs.len(),
                self.bobs.iter().map(|bob| bob.theta)
            );
            let theta_dots: DVector<f64> = DVector::from_iterator(
                self.bobs.len(),
                self.bobs.iter().map(|bob| bob.omega)
            );

            // Calculate accelerations using the matrix method
            let (_, theta_ddots) = self.calculate_accelerations(&thetas, &theta_dots);

            // Check for NaN before updating
            if theta_ddots.iter().any(|&x| x.is_nan()) {
                return 1;
            }

            // Euler integration: update velocities and positions
            for i in 0..self.bobs.len() {
                self.bobs[i].omega += theta_ddots[i] * new_dt;
                self.bobs[i].theta += self.bobs[i].omega * new_dt;

                // Calculate positions (cumulative from origin)
                let mut x = 0.0;
                let mut y = 0.0;
                for j in 0..=i {
                    x += self.bobs[j].rod.length * f64::sin(self.bobs[j].theta);
                    y += self.bobs[j].rod.length * f64::cos(self.bobs[j].theta);
                }
                self.bobs[i].pos.x = x;
                self.bobs[i].pos.y = y;
            }
        } else if self.implementation == Implementation::RK4 {
            let thetas: DVector<f64> = DVector::from_iterator(
                self.bobs.len(),
                self.bobs.iter().map(|bob| bob.theta)
            );
            let theta_dots: DVector<f64> = DVector::from_iterator(
                self.bobs.len(),
                self.bobs.iter().map(|bob| bob.omega)
            );

            let k1 = self.calculate_accelerations(&thetas, &theta_dots);
            let k2 = self.calculate_accelerations(
                &(thetas.clone() + &k1.0 * (0.5 * new_dt)),
                &(theta_dots.clone() + &k1.1 * (0.5 * new_dt))
            );
            let k3 = self.calculate_accelerations(
                &(thetas.clone() + &k2.0 * (0.5 * new_dt)),
                &(theta_dots.clone() + &k2.1 * (0.5 * new_dt))
            );
            let k4 = self.calculate_accelerations(
                &(thetas.clone() + &k3.0 * (1.0 * new_dt)),
                &(theta_dots.clone() + &k3.1 * (1.0 * new_dt))
            );

            // Calculate deltas: (k1 + 2*k2 + 2*k3 + k4) * dt/6
            let theta_deltas = (&k1.0 + &k2.0 * 2.0 + &k3.0 * 2.0 + &k4.0) * (new_dt / 6.0);
            let theta_dot_deltas = (&k1.1 + &k2.1 * 2.0 + &k3.1 * 2.0 + &k4.1) * (new_dt / 6.0);
            // Update bobs
            for i in 0..self.bobs.len() {
                self.bobs[i].theta += theta_deltas[i];
                self.bobs[i].omega += theta_dot_deltas[i];

                // Calculate positions (cumulative from origin)
                let mut x = 0.0;
                let mut y = 0.0;
                for j in 0..=i {
                    x += self.bobs[j].rod.length * f64::sin(self.bobs[j].theta);
                    y += self.bobs[j].rod.length * f64::cos(self.bobs[j].theta);
                }
                self.bobs[i].pos.x = x;
                self.bobs[i].pos.y = y;
            }
        } else if self.implementation == Implementation::Hamiltonian {
            // Placeholder for Hamiltonian method
        }
        for bob in &mut self.bobs {
            bob.add_trail_point(bob.pos, bob.color, 250);
        }
        return 0;
    }
    fn calculate_accelerations(
        &self,
        thetas: &DVector<f64>,
        theta_dots: &DVector<f64>
    ) -> (DVector<f64>, DVector<f64>) {
        let n = self.bobs.len();

        // Build the mass matrix M (corresponds to A() in JS)
        let mut m: DMatrix<f64> = DMatrix::from_element(n, n, 0.0);
        for i in 0..n {
            for j in 0..n {
                m[(i, j)] =
                    ((n as f64) - f64::max(i as f64, j as f64)) * f64::cos(thetas[i] - thetas[j]);
            }
        }

        // Build the force vector (corresponds to b() in JS)
        let mut v = DVector::from_element(n, 0.0);
        for i in 0..n {
            let mut sum = 0.0;
            for j in 0..n {
                sum -=
                    ((n as f64) - f64::max(i as f64, j as f64)) *
                    f64::sin(thetas[i] - thetas[j]) *
                    f64::powi(theta_dots[j], 2);
            }
            sum -= self.gravity * ((n as f64) - (i as f64)) * f64::sin(thetas[i]);
            v[i] = sum;
        }

        // Solve M * theta_ddot = v for theta_ddot (corresponds to lusolve in JS)
        let lu = LU::new(m);
        let theta_ddots = lu.solve(&v).unwrap_or_else(|| DVector::from_element(n, 0.0));

        // Return [thetaDots, thetaDDots] matching JS: return [thetaDots, math.lusolve(A, b).map(x => x[0])]
        (theta_dots.clone(), theta_ddots)
    }
    pub fn reset(&mut self) {
        *self = Universe::new();
    }
    pub fn add_bob(
        &mut self,
        px: f64,
        py: f64,
        omega: f64,
        theta: f64,
        rl: f64,
        rm: f64,
        rc: u32,
        radius: i32,
        mass: f64,
        color: u32
    ) {
        self.bobs.push(Bob::new(px, py, omega, theta, rl, rm, rc, radius, mass, color));
    }

    pub fn random_color() -> u32 {
        // Generate a random color in ff0000,0000ff,00ff00,f0f000,00f0f0,f000f0
        let colors = [0xff0000, 0x0000ff, 0x00ff00, 0xf0f000, 0x00f0f0, 0xf000f0];
        colors[rand::rng().random_range(0..colors.len())]
    }
    pub fn add_bob_simple(&mut self, theta: f64) {
        let default_length = 100.0;
        let default_mass = 10.0;
        let default_color = Self::random_color();
        let default_rod_color = 0x0f0f0f;

        // Calculate position from previous bob or origin
        let (px, py) = if let Some(last_bob) = self.bobs.last() {
            (
                last_bob.pos.x + default_length * f64::sin(theta),
                last_bob.pos.y + default_length * f64::cos(theta),
            )
        } else {
            (default_length * f64::sin(theta), default_length * f64::cos(theta))
        };

        self.bobs.push(
            Bob::new(
                px,
                py,
                0.0,
                theta,
                default_length,
                default_mass,
                default_rod_color,
                10,
                default_mass,
                default_color
            )
        );
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

    pub fn update_bob_theta(&mut self, index: usize, theta: f64) {
        if index < self.bobs.len() {
            self.bobs[index].theta = theta;

            // Recalculate positions for this bob and all subsequent bobs
            for i in index..self.bobs.len() {
                let (mut x, mut y) = if i == 0 {
                    (0.0, 0.0)
                } else {
                    (self.bobs[i - 1].pos.x, self.bobs[i - 1].pos.y)
                };

                x += self.bobs[i].rod.length * f64::sin(self.bobs[i].theta);
                y += self.bobs[i].rod.length * f64::cos(self.bobs[i].theta);

                self.bobs[i].pos.x = x;
                self.bobs[i].pos.y = y;
            }
        }
    }

    pub fn update_bob_length(&mut self, index: usize, length: f64) {
        if index < self.bobs.len() {
            self.bobs[index].rod.length = length;
            // Recalculate positions for this bob and all subsequent bobs
            self.update_bob_theta(index, self.bobs[index].theta);
        }
    }

    pub fn update_bob_mass(&mut self, index: usize, mass: f64) {
        if index < self.bobs.len() {
            self.bobs[index].mass = mass;
        }
    }

    pub fn get_trails(&self) -> JsValue {
        let trails: Vec<Vec<Trail>> = self.bobs
            .iter()
            .map(|bob| bob.trail.clone())
            .collect();
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

    pub fn set_implementation(&mut self, implementation: Implementation) {
        self.implementation = implementation;
    }
    pub fn get_implementation(&self) -> Implementation {
        return self.implementation;
    }
}
