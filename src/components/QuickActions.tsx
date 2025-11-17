import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarPlus, 
  Receipt, 
  Phone, 
  BarChart3,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      icon: CalendarPlus,
      label: "Request Schedule Change",
      href: "/schedule",
      color: "text-[#275559]",
      description: "Propose schedule modifications"
    },
    {
      icon: Receipt,
      label: "Share Expense",
      href: "/documents",
      color: "text-[#275559]",
      description: "Log shared expenses"
    },
  ];

  const handleEmergencyContact = () => {
    // In a real app, this would show emergency contact options
    alert("Emergency contact feature would be implemented here");
  };

  const handleViewReports = () => {
    // In a real app, this would navigate to reports dashboard
    alert("Reports dashboard would be implemented here");
  };

  const handleAction = (href: string, label: string) => {
    if (href === "#") {
      if (label === "Emergency Contact") {
        handleEmergencyContact();
      } else if (label === "View Reports") {
        handleViewReports();
      }
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-lg font-serif font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            
            if (action.href === "#") {
              return (
                <Button
                  key={action.label}
                  onClick={() => handleAction(action.href, action.label)}
                  className="w-full flex items-center justify-between p-3 border border-[#275559] border-opacity-20 rounded-lg hover:bg-[#275559] hover:bg-opacity-5 hover:border-[#275559] transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${action.color}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {action.description}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              );
            }
            
            return (
              <Link key={action.label} href={action.href} className="w-full flex items-center justify-between p-3 border border-[#275559] border-opacity-20 rounded-lg hover:bg-[#275559] hover:bg-opacity-5 hover:border-[#275559] transition-all duration-200 block">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      {action.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {action.description}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
