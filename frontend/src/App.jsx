import Home from "./pages/Home";
import Products from "./pages/Products";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Collection from "./pages/Collection";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
