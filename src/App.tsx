import { SimulationProvider } from './contexts/SimulationContext'
import { GraphicsProvider } from './contexts/GraphicsContext'
import { PitchSimulator } from './scenarios/pitch/PitchSimulator'

function App() {
  return (
    <GraphicsProvider>
      <SimulationProvider>
        <PitchSimulator />
      </SimulationProvider>
    </GraphicsProvider>
  )
}

export default App
