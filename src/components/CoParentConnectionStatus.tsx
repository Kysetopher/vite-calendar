import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Users } from "lucide-react";

export default function CoParentConnectionStatus() {
  const { isAuthenticated } = useAuth();
  
  const { data: coParents = [], isLoading } = useQuery({
    queryKey: ["/api/coparent/relationships"],
    enabled: isAuthenticated,
  });

  if (isLoading || !Array.isArray(coParents) || coParents.length === 0) {
    return null;
  }

  // Deduplicate co-parents by their ID to avoid showing the same person twice
  const uniqueCoParents = coParents.reduce((acc: any[], relationship: any) => {
    const coParentUser = relationship.coParentUser;
    if (!coParentUser) return acc;
    
    // Check if this co-parent is already in the list
    const existingCoParent = acc.find(item => item.coParentUser.id === coParentUser.id);
    if (!existingCoParent) {
      acc.push(relationship);
    }
    
    return acc;
  }, []);

  return (
    <Card className="shadow border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Co-Parent Connected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uniqueCoParents.map((relationship: any) => {
            const coParentUser = relationship.coParentUser;
            
            return (
              <div key={`coparent-${coParentUser.id}`} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={coParentUser.profile_image_url} />
                  <AvatarFallback>
                    {coParentUser.first_name?.charAt(0) || coParentUser.email?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {coParentUser.first_name && coParentUser.last_name
                      ? `${coParentUser.first_name} ${coParentUser.last_name}`
                      : coParentUser.email
                    }
                  </p>
                  <p className="text-xs text-green-600">{coParentUser.email}</p>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <Users className="h-3 w-3 mr-1" />
                  {relationship.relationship || "Co-parent"}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}