import { Routes, Route} from "react-router-dom";

import Register from "./pages/register";
import Login  from "./pages/login";
import Profile from "./pages/profile";
import ForgotPassword from "./pages/forgot_password";
import ResetPassword from "./pages/reset_password";
import Dashboard from "./pages/dashboard";
import StaffLogin from "./pages/staff_login";
import Notifications from "./pages/notifications";

import UsersPage from "./pages/admin/userspage";
import AdminRegisterUser from "./pages/admin/adminRegisterUsers";
import AllUsers from "./pages/admin/AllUsers";
import UserProfile from "./pages/UserProfile";
import EditUserProfile from "./pages/EditUserProfile";

import DepartmentPage from "./pages/admin/DepartmentPage";
import CreateDepartment from "./pages/admin/CreateDepartment";
import AllDepartments from "./pages/admin/AllDepartments";
import DepartmentDetails from "./pages/admin/DepartmentDetails";

import TicketPage from "./pages/Tickets/TicketPage";
import CreateTicket from "./pages/Tickets/CreateTicket";
import AllTickets from "./pages/Tickets/AllTickets";
import TicketDetail from "./pages/Tickets/TicketDetail";
import TicketHistoryPage from "./pages/Tickets/TicketHistoryPage";
import ReportsPage from "./pages/ReportsPage";


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login/" element={<Login />} />
      <Route path="/staff-login" element={<StaffLogin />} />

      <Route path="/profile" element={<Profile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/users" element={<UsersPage />} />
      <Route path="/users/register" element={<AdminRegisterUser />} />
      <Route path="/users/all" element={<AllUsers />} />
      <Route path="/users/profile/:id" element={<UserProfile />} />
      <Route path="/users/edit/:id" element={<EditUserProfile />} />
      
      <Route path="/departments" element={<DepartmentPage />} />
      <Route path="/departments/create" element={<CreateDepartment />} /> 
      <Route path="/departments/all" element={<AllDepartments />} /> 
      <Route path="/departments/:id" element={<DepartmentDetails />} />

      <Route path="/tickets" element={<TicketPage />} />
      <Route path="/tickets/create" element={<CreateTicket />} />
      <Route path="/tickets/all" element={<AllTickets />} />
      <Route path="/tickets/my" element={<AllTickets />} />
      <Route path="/tickets/:id" element={<TicketDetail />}  />
      <Route path="/tickets/:ticket_id/history" element={<TicketHistoryPage />} />

      <Route path="/reports" element={<ReportsPage />} />
    
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
    
  );
}

export default App;