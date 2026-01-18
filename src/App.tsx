import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard, AddBabyPage, BabyProfilePage, LogFoodPage, FoodDetailPage, LogDetailPage, AllergenTrackerPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/babies/new" element={<AddBabyPage />} />
        <Route path="/babies/:id" element={<BabyProfilePage />} />
        <Route path="/log" element={<LogFoodPage />} />
        <Route path="/log/:babyId" element={<LogFoodPage />} />
        <Route path="/foods/:foodId" element={<FoodDetailPage />} />
        <Route path="/logs/:logId" element={<LogDetailPage />} />
        <Route path="/allergens" element={<AllergenTrackerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
