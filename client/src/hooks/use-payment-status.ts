import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";

interface Payment {
  id: number;
  userId: number;
  amount: string;
  utrNumber: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export function usePaymentStatus() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Check every 5 seconds for status updates
  });

  useEffect(() => {
    if (!payments.length) return;

    // Check for recently updated payments
    const recentPayments = payments.filter(payment => {
      const createdAt = new Date(payment.createdAt);
      const timeDiff = Date.now() - createdAt.getTime();
      return timeDiff < 60000; // Within last minute
    });

    recentPayments.forEach(payment => {
      if (payment.status === "Approved") {
        toast({
          title: "Payment Approved!",
          description: `₹${payment.amount} has been added to your wallet successfully.`,
          variant: "default",
        });
      } else if (payment.status === "Declined") {
        toast({
          title: "Payment Failed",
          description: "Your payment transaction has been declined. Please try again or contact support.",
          variant: "destructive",
        });
      }
    });
  }, [payments, toast]);

  return { payments };
}