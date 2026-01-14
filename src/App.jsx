
import './App.css'
import DistanceTracker from './DistanceTracker'

function App() {
    return <DistanceTracker targetLat={51.46386} targetLon={-2.5955} updateInterval={5} complete={() => {
    }}/>
}

export default App
