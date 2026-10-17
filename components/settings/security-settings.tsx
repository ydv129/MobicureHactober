"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedPassword = localStorage.getItem("mobicure_master_password");

    if (storedPassword) {
      setMasterPassword(storedPassword);
      setIsPasswordSet(true);
    }
  }, []);

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isPasswordSet && !currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (isPasswordSet && currentPassword !== masterPassword) {
      toast({
        title: "Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    setTimeout(() => {
      // Store password securely (should use backend API for production)
      localStorage.setItem("mobicure_master_password", newPassword);
      setMasterPassword(newPassword);
      setIsPasswordSet(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: isPasswordSet
          ? "Master password updated successfully"
          : "Master password set successfully",
      });

      setIsUpdating(false);
    }, 1500);
  };

  return (
    <Card className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-xl shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative border-b border-primary/10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <Key className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-[var(--font-heading)]">
                {isPasswordSet
                  ? "Update Master Password"
                  : "Set Master Password"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Secure your vault with a strong master password
              </p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-lg border ${isPasswordSet ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"}`}
          >
            <span
              className={`text-xs font-semibold ${isPasswordSet ? "text-success" : "text-warning"}`}
            >
              {isPasswordSet ? "CONFIGURED" : "NOT SET"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-8 space-y-6">
        {isPasswordSet && (
          <div className="space-y-3">
            <Label
              htmlFor="current-password"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              Current Password
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 bg-muted/30 border-2 border-primary/20 focus:border-primary/50 rounded-lg transition-all"
              placeholder="Enter your current password"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="new-password"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              {isPasswordSet ? "New Password" : "Master Password"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 bg-muted/30 border-2 border-primary/20 focus:border-primary/50 rounded-lg transition-all"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              Confirm Password
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 bg-muted/30 border-2 border-primary/20 focus:border-primary/50 rounded-lg transition-all"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <Button
          onClick={handlePasswordUpdate}
          disabled={isUpdating}
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 border-0"
        >
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Updating...
            </span>
          ) : isPasswordSet ? (
            "Update Master Password"
          ) : (
            "Set Master Password"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
