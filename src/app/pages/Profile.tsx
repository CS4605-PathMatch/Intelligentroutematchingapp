import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  ArrowLeft,
  Star,
  Shield,
  Award,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import { mockCyclist } from "../data/mockData";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();

  // Mock reviews
  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2026-02-08",
      comment: "Super fast and friendly! Alex made the delivery seamless.",
    },
    {
      id: 2,
      author: "James K.",
      rating: 5,
      date: "2026-02-06",
      comment: "Very professional and kept me updated throughout. Highly recommend!",
    },
    {
      id: 3,
      author: "Emily R.",
      rating: 4,
      date: "2026-02-04",
      comment: "Great service, delivery was right on time.",
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 98, percentage: 77 },
    { stars: 4, count: 22, percentage: 17 },
    { stars: 3, count: 5, percentage: 4 },
    { stars: 2, count: 2, percentage: 2 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">Profile</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <img 
              src={mockCyclist.avatar}
              alt={mockCyclist.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl text-gray-900">{mockCyclist.name}</h2>
                {mockCyclist.verified && (
                  <Shield className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg text-gray-900">{mockCyclist.rating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{mockCyclist.totalTrips} deliveries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(mockCyclist.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl text-gray-900">98%</div>
              <div className="text-xs text-gray-600">On-time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-gray-900">99%</div>
              <div className="text-xs text-gray-600">Acceptance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-gray-900">24</div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
          </div>
        </Card>

        {/* Verification badges */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verification & Safety
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-900">Identity verified</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Verified</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-900">Background check</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Verified</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-900">Phone number</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Verified</Badge>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
              <div className="text-2xl mb-1">🚴</div>
              <div className="text-sm text-gray-900">Century Club</div>
              <div className="text-xs text-gray-600">100+ deliveries</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm text-gray-900">Top Rated</div>
              <div className="text-xs text-gray-600">4.8+ rating</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm text-gray-900">Speed Demon</div>
              <div className="text-xs text-gray-600">95%+ on-time</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-3 border border-pink-200">
              <div className="text-2xl mb-1">🌱</div>
              <div className="text-sm text-gray-900">Eco Warrior</div>
              <div className="text-xs text-gray-600">500kg CO₂ saved</div>
            </div>
          </div>
        </Card>

        {/* Rating breakdown */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Rating Breakdown</h3>
          <div className="space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 text-sm text-gray-600">
                  <span>{item.stars}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
                <Progress value={item.percentage} className="flex-1" />
                <span className="text-sm text-gray-600 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{review.author}</span>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Report button */}
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          Report User
        </Button>
      </div>
    </div>
  );
}