import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ParticleBackground from './components/ParticleBackground';

// Pages
import RoleSelection from './pages/RoleSelection';
import EmployeeLogin from './pages/EmployeeLogin';
import ScrumMasterLogin from './pages/ScrumMasterLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeGoals from './pages/EmployeeGoals';
import EmployeeBreak from './pages/EmployeeBreak';
import ScrumMasterHome from './pages/ScrumMasterHome';
import AssignTask from './pages/AssignTask';
import EmployeeDetails from './pages/EmployeeDetails';
import SingleEmployeeDetail from './pages/SingleEmployeeDetail';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/scrum/login" element={<ScrumMasterLogin />} />
        
        <Route path="/employee/:id" element={<EmployeeDashboard />} />
        <Route path="/employee/:id/goals" element={<EmployeeGoals />} />
        <Route path="/employee/:id/break" element={<EmployeeBreak />} />
        
        <Route path="/scrum/:id" element={<ScrumMasterHome />} />
        <Route path="/scrum/:id/assign" element={<AssignTask />} />
        <Route path="/scrum/:id/employees" element={<EmployeeDetails />} />
        <Route path="/scrum/:id/employee/:empId" element={<SingleEmployeeDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-darkBg text-white font-body selection:bg-electricBlue/30 selection:text-electricBlue relative cursor-default overflow-x-hidden">
        <ParticleBackground />
        
        {/* Router Render Target */}
        <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}
