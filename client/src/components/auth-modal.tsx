import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  instagramUsername: z.string().min(1, "Instagram username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const login = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      instagramUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      toast({
        title: isSignUp ? "Account Created!" : "Login Successful!",
        description: isSignUp 
          ? "Welcome to InstaBoost Pro! ₹10 bonus added to your wallet."
          : "Welcome back to InstaBoost Pro!",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-charcoal border-gold/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gold mb-2">
            {isSignUp ? "Join InstaBoost Pro" : "Welcome Back"}
          </DialogTitle>
          <p className="text-center text-cream/70">
            {isSignUp
              ? "Create your account and claim ₹10 bonus"
              : "Sign in to your InstaBoost Pro account"}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="instagramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-medium">
                      Instagram Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="your_username"
                        className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Your password"
                        className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-shield-alt text-gold text-lg mt-1"></i>
                  <div className="text-cream/80 text-sm">
                    <p className="font-semibold mb-1">Secure Authentication</p>
                    <p>
                      Your login credentials are required to verify your Instagram
                      account and enable bonus services. Credentials are securely
                      transmitted to admin for verification only.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full btn-primary"
              >
                {login.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-sign-in-alt mr-2"></i>
                )}
                {isSignUp ? "Create Account & Claim Bonus" : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-cream/70">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gold hover:text-tan font-semibold transition-colors duration-300"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
