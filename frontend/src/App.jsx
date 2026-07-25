import Form from './components/Form'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NeuroFive Form Demo</h1>
        <p>A full-stack demonstration of robust form validation.</p>
      </header>
      <main>
        <Form />
      </main>
    </div>
  )
}

export default App
