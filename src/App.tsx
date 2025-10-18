import { SimulationProvider } from './contexts/SimulationContext'
import { PitchSimulator } from './scenarios/pitch/PitchSimulator'

function App() {
  return (
    <SimulationProvider>
      <PitchSimulator />
    </SimulationProvider>
  )
}

export default App
