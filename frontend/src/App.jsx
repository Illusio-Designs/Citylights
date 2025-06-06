import Home from "./pages/Home";
import Products from "./pages/Products";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Collection from "./pages/Collection";
import Store from './pages/Store';
import Aboutus from './pages/Aboutus';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/store" element={<Store />} />
          <Route path="/about" element={<Aboutus />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
