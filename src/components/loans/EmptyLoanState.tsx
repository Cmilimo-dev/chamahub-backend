
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface EmptyLoanStateProps {
  type: 'active' | 'my-loans';
  count: number;
}

const EmptyLoanState = ({ type, count }: EmptyLoanStateProps) => {
  const config = {
    active: {
      icon: TrendingUp,
      title: "No active loans",
      description: "Active loans will appear here once disbursed."
    },
    'my-loans': {
      icon: DollarSign,
      title: "No loan applications",
      description: "Your loan applications will appear here."
    }
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyLoanState;
