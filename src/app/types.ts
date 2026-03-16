export type UserType = "cyclist" | "customer";

export interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  joinedDate: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface CyclistRoute {
  id: string;
  cyclistId: string;
  startLocation: Location;
  endLocation: Location;
  startTime: string;
  estimatedEndTime: string;
  status: "planning" | "active" | "completed";
  waypoints: Location[];
}

export interface Errand {
  id: string;
  customerId: string;
  customerName: string;
  customerRating: number;
  pickupLocation: Location;
  dropoffLocation: Location;
  description: string;
  items: string[];
  payment: number;
  tip?: number;
  urgency: "flexible" | "soon" | "urgent";
  requestedTime: string;
  status: "pending" | "matched" | "in-progress" | "completed" | "cancelled";
  cyclistId?: string;
  deviation: number; // in km
  matchScore: number; // 0-100
}

export interface DeliveryTracking {
  orderId: string;
  cyclist: User;
  currentLocation: Location;
  estimatedArrival: string;
  status: "picked-up" | "in-transit" | "nearby" | "delivered";
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: string;
  message: string;
  location?: Location;
}

export interface Payment {
  orderId: string;
  amount: number;
  tip: number;
  serviceFee: number;
  total: number;
  status: "pending" | "completed" | "refunded";
  method: string;
}
