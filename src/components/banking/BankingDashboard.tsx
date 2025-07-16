
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Building2, Bell, Settings, Plus } from "lucide-react";
import PaymentMethodsModal from "./PaymentMethodsModal";
import TransactionNotifications from "./TransactionNotifications";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import MobileHeader from "@/components/MobileHeader";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

const BankingDashboard = () => {
  const { paymentMethods, loading } = usePaymentMethods();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  const primaryMethod = paymentMethods.find(method => method.is_primary);
  const verifiedMethods = paymentMethods.filter(method => method.is_verified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {isMobile ? <MobileHeader /> : <Header />}
      
      <main className="pb-safe">
        <ResponsiveContainer className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="text-center py-2 sm:py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Banking & Payments
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your payment methods and view transaction history
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Methods</p>
                    <p className="text-2xl font-bold">{paymentMethods.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Verified Methods</p>
                    <p className="text-2xl font-bold">{verifiedMethods.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Primary Method</p>
                    <p className="text-lg font-bold">{primaryMethod?.provider || 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Banking Dashboard</CardTitle>
                <PaymentMethodsModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </PaymentMethodsModal>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Payment Methods</h3>
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : paymentMethods.length === 0 ? (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">No payment methods added yet</p>
                            <PaymentMethodsModal>
                              <Button>Add Your First Payment Method</Button>
                            </PaymentMethodsModal>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-4">
                          {paymentMethods.map((method) => (
                            <Card key={method.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {method.method_type === 'mobile_money' ? (
                                      <Smartphone className="h-5 w-5 text-green-600" />
                                    ) : method.method_type === 'bank_account' ? (
                                      <Building2 className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <CreditCard className="h-5 w-5 text-purple-600" />
                                    )}
                                    <div>
                                      <p className="font-medium">{method.provider}</p>
                                      <p className="text-sm text-gray-600">{method.account_identifier}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {method.is_primary && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        Primary
                                      </span>
                                    )}
                                    {method.is_verified ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        Verified
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                        Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-6">
                  <TransactionNotifications />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Banking Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Banking settings and preferences will be available here.</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default BankingDashboard;
