import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { PageTransition } from "@/components/PageTransition";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created! You're now signed in.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-8 space-y-6 border-none">
            <div className="text-center space-y-4">
              <Scale className="h-12 w-12 mx-auto text-greek-gold" />
              <h1 className="font-serif font-medium text-3xl text-foreground tracking-tight">
                {isLogin ? "Sign In" : "Sign Up"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Welcome back to BothSides" : "Join BothSides today"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
