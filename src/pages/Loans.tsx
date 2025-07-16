
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MobileHeader from "@/components/MobileHeader";
import Header from "@/components/Header";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import MyAppliedLoans from "@/components/loans/MyAppliedLoans";
import AvailableLoans from "@/components/loans/AvailableLoans";
import LoanHistory from "@/components/loans/LoanHistory";
import LoanRepaymentTracker from "@/components/loans/LoanRepaymentTracker";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Loans = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-loans");
  const isMobile = useIsMobile();

  const getUserName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const tabs = [
    { value: "my-loans", label: isMobile ? "My Loans" : "My Applied Loans" },
    { value: "available", label: isMobile ? "Available" : "Available Loans" },
    { value: "history", label: isMobile ? "History" : "Loan History" },
    { value: "repayments", label: isMobile ? "Payments" : "Repayment Tracker" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {isMobile ? <MobileHeader /> : <Header />}
      
      <main className="pb-safe">
        <ResponsiveContainer className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="text-center py-2 sm:py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Loan Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your loans, applications, and repayments all in one place
            </p>
          </div>

          {/* Loan Management Tabs */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Loan Dashboard</CardTitle>
              <CardDescription className="text-sm">
                Manage your loan applications, track repayments, and view loan opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} ${isMobile ? 'h-auto' : ''}`}>
                  {isMobile ? (
                    <>
                      <div className="col-span-2 grid grid-cols-2 gap-1">
                        {tabs.slice(0, 2).map((tab) => (
                          <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-1 mt-1">
                        {tabs.slice(2).map((tab) => (
                          <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </div>
                    </>
                  ) : (
                    tabs.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))
                  )}
                </TabsList>
                
                <TabsContent value="my-loans" className="mt-4 sm:mt-6">
                  <MyAppliedLoans />
                </TabsContent>
                
                <TabsContent value="available" className="mt-4 sm:mt-6">
                  <AvailableLoans />
                </TabsContent>
                
                <TabsContent value="history" className="mt-4 sm:mt-6">
                  <LoanHistory />
                </TabsContent>
                
                <TabsContent value="repayments" className="mt-4 sm:mt-6">
                  <LoanRepaymentTracker />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default Loans;
