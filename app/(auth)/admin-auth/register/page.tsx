
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  adminRegisterSchema,
  type AdminRegisterInput,
} from "@/validator/auth.validator";

import { registerAdminApi } from "@/lib/api-client";
import { useAuth } from "@/context/authContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import AuthLayout from "@/components/layout/auth-layout";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRegisterInput>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const onSubmit = async (data: AdminRegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await registerAdminApi(data);

      if (res.user.role !== "admin") {
        setError("Registration failed. Only admin accounts are allowed.");
        return;
      }

      login(res.token, res.user);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Admin Account"
      description="Register your administrator account to manage CampusX."
      footer={
        <>
          <p>Already have an administrator account?</p>
          <Link
            href="/admin-auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full name
          </Label>

          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            {...register("name")}
            className="h-auto w-full rounded-md px-4 py-3"
            aria-invalid={!!errors.name}
          />

          {errors.name && (
            <p className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Admin Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Admin email address
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="admin@campusfix.edu"
            autoComplete="email"
            {...register("email")}
            className="h-auto w-full rounded-md px-4 py-3"
            aria-invalid={!!errors.email}
          />

          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Only @campusfix.edu email addresses are permitted.
          </p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>

          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            {...register("password")}
            className="h-auto w-full rounded-md px-4 py-3"
            aria-invalid={!!errors.password}
          />

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Password must contain at least 6 characters.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl font-semibold transition-transform active:scale-[0.99]"
        >
          {isLoading ? "Creating account..." : "Create Admin Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
