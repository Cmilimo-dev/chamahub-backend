
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MobileHeader from "@/components/MobileHeader";
import Header from "@/components/Header";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import SavingsOverview from "@/components/SavingsOverview";
import GroupCard from "@/components/GroupCard";
import RecentTransactions from "@/components/RecentTransactions";
import QuickActions from "@/components/QuickActions";
import MobileQuickActions from "@/components/MobileQuickActions";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";
import MembershipRequestsManager from "@/components/MembershipRequestsManager";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user } = useAuth();
  const { groups, loading, error } = useRealtimeGroups();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const isMobile = useIsMobile();

  const getUserName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {isMobile ? <MobileHeader /> : <Header />}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {isMobile ? <MobileHeader /> : <Header />}
      
      <main className="pb-safe">
        <ResponsiveContainer className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="text-center py-2 sm:py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {getUserName()}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Your savings journey continues. Keep up the great work!
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. Please refresh the page or try again later.
              </AlertDescription>
            </Alert>
          )}


          {/* Savings Overview */}
          <SavingsOverview groups={groups} />

          {/* Quick Actions */}
          <div className="block sm:hidden">
            <MobileQuickActions />
          </div>
          <div className="hidden sm:block">
            <QuickActions />
          </div>

          {/* My Groups */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Groups</h2>
              <div className="flex gap-2 sm:gap-3">
                <JoinGroupModal />
                <CreateGroupModal />
              </div>
            </div>
            
            {groups.length === 0 ? (
              <Card className="text-center py-8 sm:py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">No groups yet</h3>
                      <p className="text-sm sm:text-base text-gray-600">Use the buttons above to create or join a savings group</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isSelected={selectedGroup === group.id}
                    onSelect={() => setSelectedGroup(group.id)}
                  />
                ))}
              </ResponsiveGrid>
            )}
          </section>

          {/* Membership Requests for Admins */}
          <MembershipRequestsManager />

          {/* Recent Transactions */}
          <RecentTransactions />
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default Index;
