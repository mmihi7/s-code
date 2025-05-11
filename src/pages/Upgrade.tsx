import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "PAYG (Pay As You Go)",
    icon: <Sparkles className="w-5 h-5 text-amber-500 mr-2" />,
    description: "Pay only for what you use. Flexible and scalable for growing businesses.",
    color: "from-amber-100 to-amber-50",
    button: { text: "Coming Soon", color: "bg-amber-500 hover:bg-amber-600", disabled: true }
  },
  {
    name: "Subscription",
    icon: <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />,
    description: "Unlock all premium features for a fixed monthly or yearly fee.",
    color: "from-blue-100 to-blue-50",
    button: { text: "Coming Soon", color: "bg-blue-500 hover:bg-blue-600", disabled: true }
  },
  {
    name: "Basic (Free)",
    icon: <UserCheck className="w-5 h-5 text-green-500 mr-2" />,
    description: "Stay on the free plan and enjoy core visitor management features.",
    color: "from-gray-100 to-gray-50",
    button: { text: "Current Plan", color: "bg-gray-300 text-gray-700 cursor-default", disabled: true }
  }
];

const Upgrade: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <Sparkles className="w-12 h-12 text-amber-500 mb-3" />
            <h1 className="text-3xl font-bold mb-2 text-center">Upgrade Your Plan</h1>
            <p className="text-gray-600 text-center mb-4">
              Choose the plan that fits your needs and unlock advanced features for your premise.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 flex flex-col items-center bg-gradient-to-r ${plan.color}`}
              >
                <div className="flex items-center mb-2">
                  {plan.icon}
                  <span className="font-semibold text-lg">{plan.name}</span>
                </div>
                <p className="text-gray-700 mb-2 text-center text-sm">{plan.description}</p>
                <Button
                  className={`${plan.button.color} w-full mt-1`}
                  disabled={plan.button.disabled}
                >
                  {plan.button.text}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            Need a custom plan?{" "}
            <a href="mailto:support@scode.com" className="underline">
              Contact us
            </a>
            <br />
            <Button
              variant="link"
              className="mt-2 text-blue-600"
              onClick={() => navigate(-1)}
            >
              &larr; Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Upgrade;