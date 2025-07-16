
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const EmptyLoansState = () => {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-500">No pending loan applications to review at this time.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyLoansState;
