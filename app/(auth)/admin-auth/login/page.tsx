
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/validator/auth.validator";

import { loginApi } from "@/lib/api-client";
import { useAuth } from "@/context/authContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import AuthLayout from "@/components/layout/auth-layout";

export default function AdminLoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await loginApi(data);

      if (res.user.role !== "admin") {
        setError("Access denied. This portal is restricted to administrators.");
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

  const handleGoogleLogin = () => {
    setError("Google sign-in is not configured yet.");
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to access your CampusX administration portal."
      footer={
        <>
          <p>Authorized administrators only.</p>
          <Link
            href="/"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Back to home
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

        {/* Google Sign In */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleGoogleLogin}
          className="flex h-auto w-full items-center justify-center gap-3 px-4 py-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.62 5.91c4.45-4.11 7.15-10.16 7.15-17.56Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.8 23.8 0 0 0 0 24c0 3.86.92 7.52 2.56 10.78l7.97-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.27-8.28 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>

          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/60" />
          <span className="mx-4 text-xs text-muted-foreground">
            OR CONTINUE WITH EMAIL
          </span>
          <div className="flex-grow border-t border-border/60" />
        </div>

        {/* Email */}
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
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>

            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register("password")}
            className="h-auto w-full rounded-md px-4 py-3"
            aria-invalid={!!errors.password}
          />

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl font-semibold transition-transform active:scale-[0.99]"
        >
          {isLoading ? "Authenticating..." : "Login to Admin Portal"}
        </Button>
      </form>
    </AuthLayout>
  );
}
