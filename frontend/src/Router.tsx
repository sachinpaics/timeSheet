/**
 * @author [Sachin Pai]
 * @email [sachin.pai@atmecs.com]
 * @desc This file is responsible for managing routes through out the app
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/App";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import CurrentTimeSheet from "./pages/CurrentTimeSheet";
import AllTimeSheets from "./pages/AllTImeSheets"

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/timesheet" element={<CurrentTimeSheet />} />
                <Route path="/allSheets" element={<AllTimeSheets />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router