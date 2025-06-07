import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Briefcase, GraduationCap, DollarSign } from "lucide-react";
import type { User } from "@shared/schema";

interface CandidateCardProps {
  candidate: User;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const profileData = candidate.profileData as any || {};
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-red-400 to-red-600",
      "from-yellow-400 to-yellow-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Avatar className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${getGradientClass(candidate.id)}`}>
            <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
              {getInitials(candidate.username)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold text-gray-900">{candidate.username}</h3>
          <p className="text-gray-600">{profileData.title || "Professional"}</p>
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-1" />
            {profileData.location || "Location not specified"}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 w-4" />
            <span>{profileData.experience || "Experience not specified"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2 w-4" />
            <span>{profileData.education || "Education not specified"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 w-4" />
            <span>{profileData.expectedSalary || "Salary expectations not specified"}</span>
          </div>
        </div>

        {profileData.skills && profileData.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {profileData.skills.slice(0, 4).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="bg-blue-100 text-primary text-xs">
                  {skill}
                </Badge>
              ))}
              {profileData.skills.length > 4 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  +{profileData.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button className="flex-1 text-sm">
            Contact
          </Button>
          <Button variant="outline" className="flex-1 text-sm">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
