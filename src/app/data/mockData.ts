import { User, CyclistRoute, Errand, Location } from "../types";

export const mockCyclist: User = {
  id: "c1",
  name: "Alex Chen",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  rating: 4.8,
  totalTrips: 127,
  verified: true,
  joinedDate: "2025-08-15",
};

export const mockCustomer: User = {
  id: "u1",
  name: "Sarah Johnson",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  rating: 4.9,
  totalTrips: 43,
  verified: true,
  joinedDate: "2025-11-02",
};

export const mockLocations: Record<string, Location> = {
  downtown: {
    lat: 40.7589,
    lng: -73.9851,
    address: "Times Square, New York, NY",
  },
  parkside: {
    lat: 40.7812,
    lng: -73.9665,
    address: "Central Park West, New York, NY",
  },
  eastside: {
    lat: 40.7614,
    lng: -73.9776,
    address: "5th Avenue, New York, NY",
  },
  westside: {
    lat: 40.7580,
    lng: -73.9855,
    address: "9th Avenue, New York, NY",
  },
  midtown: {
    lat: 40.7549,
    lng: -73.9840,
    address: "34th Street, New York, NY",
  },
  uppereast: {
    lat: 40.7736,
    lng: -73.9566,
    address: "Lexington Avenue, New York, NY",
  },
};

export const mockCurrentRoute: CyclistRoute = {
  id: "r1",
  cyclistId: "c1",
  startLocation: mockLocations.downtown,
  endLocation: mockLocations.parkside,
  startTime: new Date(Date.now() + 5 * 60000).toISOString(), // 5 min from now
  estimatedEndTime: new Date(Date.now() + 25 * 60000).toISOString(), // 25 min from now
  status: "planning",
  waypoints: [mockLocations.eastside],
};

export const mockErrands: Errand[] = [
  {
    id: "e1",
    customerId: "u2",
    customerName: "Mike Torres",
    customerRating: 4.7,
    pickupLocation: mockLocations.eastside,
    dropoffLocation: mockLocations.parkside,
    description: "Pick up prescription from pharmacy",
    items: ["Prescription medication", "Receipt required"],
    payment: 8.50,
    tip: 2.00,
    urgency: "soon",
    requestedTime: new Date(Date.now() + 15 * 60000).toISOString(),
    status: "pending",
    deviation: 0.3,
    matchScore: 95,
  },
  {
    id: "e2",
    customerId: "u3",
    customerName: "Emma Wilson",
    customerRating: 5.0,
    pickupLocation: mockLocations.westside,
    dropoffLocation: mockLocations.midtown,
    description: "Grab coffee and pastries",
    items: ["2 lattes", "3 croissants"],
    payment: 6.00,
    urgency: "urgent",
    requestedTime: new Date(Date.now() + 10 * 60000).toISOString(),
    status: "pending",
    deviation: 0.8,
    matchScore: 72,
  },
  {
    id: "e3",
    customerId: "u4",
    customerName: "David Kim",
    customerRating: 4.9,
    pickupLocation: mockLocations.midtown,
    dropoffLocation: mockLocations.uppereast,
    description: "Return library books",
    items: ["3 books in bag"],
    payment: 5.50,
    urgency: "flexible",
    requestedTime: new Date(Date.now() + 30 * 60000).toISOString(),
    status: "pending",
    deviation: 1.2,
    matchScore: 58,
  },
];

export const mockCyclistStats = {
  todayEarnings: 42.50,
  weekEarnings: 186.25,
  monthEarnings: 724.80,
  completedToday: 6,
  activeErrands: 1,
  avgRating: 4.8,
};

export const mockCustomerOrders = [
  {
    id: "o1",
    date: "2026-02-09",
    cyclistName: "Alex Chen",
    description: "Grocery pickup",
    amount: 12.50,
    status: "completed" as const,
  },
  {
    id: "o2",
    date: "2026-02-07",
    cyclistName: "Jordan Lee",
    description: "Document delivery",
    amount: 8.00,
    status: "completed" as const,
  },
  {
    id: "o3",
    date: "2026-02-05",
    cyclistName: "Taylor Brooks",
    description: "Pharmacy pickup",
    amount: 7.50,
    status: "completed" as const,
  },
];
