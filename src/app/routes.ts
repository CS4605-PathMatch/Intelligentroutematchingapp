import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CyclistDashboard from "./pages/CyclistDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CyclistActiveRoute from "./pages/CyclistActiveRoute";
import CustomerRequestErrand from "./pages/CustomerRequestErrand";
import CustomerTrackDelivery from "./pages/CustomerTrackDelivery";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      {
        Component: ProtectedRoute,
        children: [
          { path: "cyclist", Component: CyclistDashboard },
          { path: "cyclist/route", Component: CyclistActiveRoute },
          { path: "customer", Component: CustomerDashboard },
          { path: "customer/request", Component: CustomerRequestErrand },
          { path: "customer/track/:orderId", Component: CustomerTrackDelivery },
          { path: "profile/:userId", Component: Profile },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL });