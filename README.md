<h1 align="center">
	<br>
	<a href="https://pendulum.notaroomba.dev"><img src="public/icon.png" alt="Pendulumania" width="200"></a>
	<br>
	Pendulumania
	<br>
</h1>

<h4 align="center">
	Interactive n-pendulum simulation with a Rust physics engine compiled to WebAssembly
</h4>

<div align="center">

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![WASM](https://img.shields.io/badge/WebAssembly-%2300969C.svg?style=for-the-badge&logo=webassembly&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PixiJS](https://img.shields.io/badge/Pixi.js-%23FF66CC.svg?style=for-the-badge)

</div>

A small, interactive double pendulum demo that separates a high-performance physics engine (written in Rust and compiled to WASM) from a responsive web UI (React + TypeScript), using Ant Design for UI components and PixiJS for high-performance canvas rendering.

<p align="center">
  <a href="https://pendulum.notaroomba.dev">Live demo · pendulum.notaroomba.dev</a>
</p>

![Screenshot](/public/screenshot.png)

## Key features

- High-performance physics core implemented in Rust and compiled to WebAssembly for accurate, real-time simulation
- Smooth, interactive Web UI built with React, PixiJS, and TypeScript
- Prebuilt WASM `physics/pkg` so you can run the demo without a local Rust toolchain
- Adjustable parameters (masses, lengths, gravity, initial angles) and simulation controls (start/stop/reset)
- Different implementations (RK4, Hamltonian, etc...)

## Preview

Open https://pendulum.notaroomba.dev in a browser.

## TODO

- Presets and exportable snapshots for sharing interesting trajectories
- Plots and graphs for the simulation
- Game-ify it?


## Credits

- Rust and wasm-bindgen for the physics engine
- React for the UI, TailwindCSS for the styling, and PixiJS for rendering
- Inspiration and examples from many open-source double pendulum visualizations

## License

MIT

---

> [notaroomba.dev](https://notaroomba.dev) &nbsp;&middot;&nbsp;
> GitHub [@NotARoomba](https://github.com/NotARoomba) &nbsp;&middot;&nbsp;
