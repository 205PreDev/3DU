# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

교육용 3D 물리 시뮬레이터 (Educational 3D Physics Simulator) is a web-based platform for visualizing physics principles through interactive 3D simulations. The initial module is a **baseball pitch simulator** that demonstrates gravity, drag, and Magnus effect in real-time 3D rendering.

## Development Commands

### Quick Start
```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check without emitting
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### No Test Scripts
This project currently does not have test scripts configured. Unit tests or E2E tests are planned for future phases.

## Architecture Overview

This is a **frontend-only** React application with no backend server. The physics calculations are performed entirely client-side using custom-built physics engines.

### Core Philosophy: Modular Scenario System

The architecture is designed to support **multiple physics scenarios** (pitch, projectile motion, free fall, etc.) with a shared core platform. Each scenario is self-contained in `src/scenarios/{scenario-name}/`.

### State Management Pattern

**SimulationContext** (`src/contexts/SimulationContext.tsx`) is the central state manager using React Context + useState:

- **params**: Current simulation parameters (PitchParameters)
- **result**: Simulation output (SimulationResult | null)
- **isSimulating**: Boolean indicating simulation is running
- **uiMode**: 'simple' | 'advanced' mode toggle

**Key Methods**:
- `setParams()`: Update simulation parameters
- `setPreset(pitchType)`: Load a preset configuration (fastball, curveball, etc.)
- `setSimpleModeInputs()`: Map simple UI inputs (1-10 power) to advanced parameters
- `runSimulation()`: Execute physics calculation synchronously
- `reset()`: Reset to default state

### Physics Engine Architecture

All physics calculations are in `src/core/physics/`:

**1. Vector Operations** (`integrator.ts`):
- Pure functions for Vector3 operations: add, subtract, multiply, dot, cross, normalize
- No Three.js dependency - custom vector math for physics

**2. Numerical Integration** (`integrator.ts`):
- `eulerIntegrate()`: Simple 1st-order Euler method (fast, less accurate)
- `rk4Integrate()`: 4th-order Runge-Kutta (slower, more accurate)
- Uses `DerivativeFunction` signature: `(pos, vel, time) => { velocityDerivative, accelerationDerivative }`

**3. Force Calculations** (`forces.ts`):
- `calculateGravity()`: F = m × g × [0, -1, 0]
- `calculateDrag()`: F = -0.5 × ρ × C_d × A × |v|² × v̂
- `calculateMagnus()`: F = 0.5 × C_L × ρ × A × |v|² × (ω × v̂)
- `calculateTotalForce()`: Sum of all forces

**4. Simulator** (`simulator.ts`):
- `PitchSimulator` class orchestrates the simulation loop
- Configurable time step (default: 0.01s = 10ms)
- Records trajectory points, max height, flight time
- Checks for plate crossing (z ≤ -18.44m) and strike zone
- Returns `SimulationResult` with all calculated metrics

### Type System

All types defined in `src/types/index.ts`:

**Core Types**:
- `Vector3`: { x, y, z } - 3D vector
- `PitchParameters`: All simulation inputs (mass, radius, speed, angle, spin, environment)
- `SimulationState`: Snapshot at time t (position, velocity, spin, time)
- `SimulationResult`: Output (trajectory[], flightTime, maxHeight, plateHeight, isStrike, etc.)
- `PitchType`: 'fastball' | 'curveball' | 'slider' | 'changeup' | 'knuckleball'
- `UIMode`: 'simple' | 'advanced'

**Constants**:
- `PHYSICS_CONSTANTS`: Gravity (9.81), air density, baseball specs, mound-to-plate distance (18.44m)

### 3D Rendering with Three.js

Uses `@react-three/fiber` (React renderer for Three.js) and `@react-three/drei` (helpers):

**3D Components** (in `src/core/renderer/` and `src/scenarios/pitch/`):
- `Scene3D.tsx`: Main Canvas with camera, lights, OrbitControls
- `Ball3D.tsx`: Baseball sphere with animation along trajectory
- `TrajectoryLine.tsx`: Line geometry showing ball path
- `Field.tsx`: Baseball field floor with mound and home plate markers
- `Grid.tsx`: Visual grid helper for spatial reference

**Rendering Pattern**:
1. Context provides `result.trajectory` (Vector3[])
2. Ball3D animates through trajectory points using requestAnimationFrame or useFrame hook
3. TrajectoryLine renders entire path as Line geometry
4. OrbitControls allow user to rotate/pan/zoom camera

### Preset System

`src/scenarios/pitch/presets.ts` contains 5 pitch types with realistic parameters:

- **fastball**: 145 km/h (40.3 m/s), backspin 2400 rpm
- **curveball**: 110 km/h (30.6 m/s), topspin 2800 rpm, high drop
- **slider**: 130 km/h (36.1 m/s), sidespin for horizontal break
- **changeup**: 125 km/h (34.7 m/s), low spin 1200 rpm
- **knuckleball**: 100 km/h (27.8 m/s), minimal spin 100 rpm

Presets are complete `PitchParameters` objects that can be directly applied via `setPreset()`.

### UI Mode Mapping

**Simple Mode → Advanced Params**:
- User inputs: throwPower (1-10 slider), pitchType (dropdown)
- Mapping: `initialSpeed = 20 + throwPower * 3` (range: 23-50 m/s)
- Selected preset's spin/angle applied automatically

**Advanced Mode**:
- Direct control of all PitchParameters fields
- Tooltips explain each physics term (via `TooltipModal` component when implemented)

## Key Workflows

### Running a Simulation

1. User selects mode (simple/advanced) via `setUIMode()`
2. User inputs parameters:
   - Simple: throwPower + pitchType → `setSimpleModeInputs()`
   - Advanced: direct parameter editing → `setParams()`
3. User clicks "Start Simulation" → `runSimulation()`
4. Context calls `runSimulation(params)` from physics/simulator
5. Simulator returns `SimulationResult`
6. Context updates `result` state
7. 3D components re-render with new trajectory
8. Ball3D animates along path
9. ResultPanel displays metrics (flight time, strike/ball, etc.)

### Adding a New Pitch Preset

1. Open `src/scenarios/pitch/presets.ts`
2. Add new entry to `PITCH_PRESETS` object
3. Define all PitchParameters (refer to existing presets)
4. Add description to `PITCH_DESCRIPTIONS`
5. Add Korean name to `PITCH_NAMES`
6. TypeScript will enforce PitchType union includes new key

### Changing Physics Constants

Edit `PHYSICS_CONSTANTS` in `src/types/index.ts`:
- GRAVITY: Default 9.81 m/s²
- AIR_DENSITY_SEA_LEVEL: 1.225 kg/m³
- Baseball specs: mass (0.145 kg), radius (0.0366 m)
- Coefficients: drag (0.4), lift (0.2)

## Project Structure

```
EDU/
├── src/
│   ├── core/                     # Core platform (reusable across scenarios)
│   │   ├── physics/              # Physics engine
│   │   │   ├── integrator.ts     # Vector math + Euler/RK4
│   │   │   ├── forces.ts         # Force calculations
│   │   │   └── simulator.ts      # PitchSimulator class
│   │   ├── renderer/             # 3D rendering components
│   │   │   ├── Scene3D.tsx       # Main canvas setup
│   │   │   └── Grid.tsx          # Grid helper
│   │   └── ui/                   # Common UI components
│   │       └── ResultPanel.tsx   # Results display
│   ├── scenarios/                # Scenario-specific modules
│   │   └── pitch/                # Baseball pitch simulator
│   │       ├── presets.ts        # Pitch type presets
│   │       ├── types.ts          # Pitch-specific types
│   │       ├── Ball3D.tsx        # Baseball 3D model
│   │       ├── TrajectoryLine.tsx
│   │       ├── Field.tsx
│   │       └── PitchInputPanel.tsx
│   ├── contexts/
│   │   └── SimulationContext.tsx # Global state management
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── docs/
│   ├── 실행가이드.md              # Detailed setup/usage guide (Korean)
│   └── 작업목록.md                # Task checklist with progress (Korean)
├── public/                       # Static assets
│   └── models/                   # 3D model files (.glb)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Development Notes

### Coordinate System

- **x-axis**: Horizontal (left-right), positive = right
- **y-axis**: Vertical (up-down), positive = up
- **z-axis**: Depth (forward-backward), positive = toward pitcher, negative = toward home plate
- Mound at z=0, home plate at z=-18.44m

### Strike Zone Dimensions

Defined in `simulator.ts` `checkStrike()`:
- Width: 0.44m (±0.22m from x=0)
- Height: 0.5m to 1.1m (approximate adult strike zone)

### Time Step Considerations

- Default dt = 0.01s (10ms) provides good balance
- Smaller dt = more accurate but slower
- Euler method is fast enough for real-time; use RK4 for validation

### Performance

- Target: 30+ FPS during 3D rendering
- Trajectory typically ~100-300 points (depends on flight time)
- Physics calculation is synchronous (blocking), runs in <100ms
- No physics workers or async needed for current scope

## Important Conventions

- All distances in **meters** (not cm or feet)
- All speeds in **m/s** (not km/h or mph)
- Angles in **degrees** (converted to radians internally)
- Spin rates in **rpm** (not rad/s)
- Presets use km/h for readability but store as m/s internally

## Current Status

Based on `docs/작업목록.md`:

**Completed** (Phase 1-2):
- ✅ Project setup, dependencies, config files
- ✅ Physics engine: integrator, forces, simulator
- ✅ Type definitions
- ✅ SimulationContext
- ✅ Pitch presets (5 types)

**In Progress** (Phase 3-6):
- 🔄 3D rendering components (Ball3D, TrajectoryLine, Field)
- 🔄 UI components (InputPanel, ModeToggle, ResultPanel)
- ⏳ Main App integration
- ⏳ Styling and polish

Refer to `docs/작업목록.md` for detailed task breakdown and progress tracking.

## Troubleshooting

### Common Issues

**Physics behaves unexpectedly**:
- Check PHYSICS_CONSTANTS are correct
- Verify coordinate system (z-negative is toward plate)
- Confirm spin axis is normalized vector

**3D scene not rendering**:
- Check browser WebGL support: https://get.webgl.org/
- Inspect console for Three.js errors
- Verify Canvas component is mounted

**Type errors**:
- Run `npm run type-check` to see all errors
- Check path alias `@/*` is configured in both tsconfig.json and vite.config.ts

## Future Scenarios

To add new physics scenarios (e.g., projectile motion, pendulum):

1. Create `src/scenarios/{name}/` directory
2. Define scenario-specific types
3. Reuse `src/core/physics/` integrator and forces (add new force functions if needed)
4. Create scenario Context (or extend SimulationContext)
5. Build 3D components for visualization
6. Create input UI
7. Integrate into App.tsx with routing or tabs
