import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Welcome from "./pages/Welcome";
import CyclistDashboard from "./pages/CyclistDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CyclistActiveRoute from "./pages/CyclistActiveRoute";
import CustomerRequestErrand from "./pages/CustomerRequestErrand";
import CustomerTrackDelivery from "./pages/CustomerTrackDelivery";
import Profile from "./pages/Profile";
import LoadingScreen from "./pages/LoadingScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Welcome },
      { path: "loading", Component: LoadingScreen },
      { path: "cyclist", Component: CyclistDashboard },
      { path: "cyclist/route", Component: CyclistActiveRoute },
      { path: "customer", Component: CustomerDashboard },
      { path: "customer/request", Component: CustomerRequestErrand },
      { path: "customer/track/:orderId", Component: CustomerTrackDelivery },
      { path: "profile/:userId", Component: Profile },
    ],
  },
]);