
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  getAdminProfileApi,
  updateAdminProfileApi,
} from "@/lib/api-client";
import { useAuth } from "@/context/authContext";

import { SimpleNavbar } from "@/components/navbar/simple-navbar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Check,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
};

const emptyProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
};

export default function AdminProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const profileId = params.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<ProfileData>(emptyProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAdminProfileApi();

      const mapped: ProfileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      };

      setProfile(mapped);
      setDraft(mapped);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your profile."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify that the URL belongs to the authenticated admin.
  useEffect(() => {
    if (!user) return;

    if (user.sub.toString() !== profileId) {
      router.replace(`/admin-profile/${user.sub}`);
      return;
    }

    fetchProfile();
  }, [user, profileId, router, fetchProfile]);

  const updateField = (field: keyof ProfileData, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setError(null);
  };

  const startEditing = () => {
    if (!profile) return;

    setDraft({ ...profile });
    setIsEditing(true);
    setSaved(false);
    setError(null);
  };

  const cancelEditing = () => {
    if (profile) {
      setDraft({ ...profile });
    }

    setIsEditing(false);
    setError(null);
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaved(false);

      await updateAdminProfileApi({
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || undefined,
      });

      // Fetch the updated profile from the backend.
      const data = await getAdminProfileApi();

      const mapped: ProfileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      };

      setProfile(mapped);
      setDraft(mapped);
      setIsEditing(false);
      setSaved(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save profile changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const initials =
    (profile?.name || user?.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "A";

  const displayed = isEditing ? draft : profile ?? emptyProfile;

  const field = (
    key: keyof ProfileData,
    label: string,
    placeholder: string,
    Icon: typeof UserRound,
    type = "text"
  ) => (
    <div className="space-y-2" key={key}>
      <Label htmlFor={key}>{label}</Label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id={key}
          type={type}
          value={displayed[key]}
          placeholder={placeholder}
          readOnly={!isEditing}
          onChange={(event) => updateField(key, event.target.value)}
          className="h-11 rounded-lg pl-10 read-only:bg-muted/40 read-only:text-muted-foreground"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <SimpleNavbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background">
        <SimpleNavbar />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-sm text-destructive">
            {error || "Unable to load your profile."}
          </p>

          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchProfile}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <SimpleNavbar />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Page heading */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight className="size-4 rotate-180" />
              Back to dashboard
            </Link>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                My profile
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your administrator account information.
              </p>
            </div>
          </div>

          {!isEditing ? (
            <Button
              onClick={startEditing}
              className="shrink-0 gap-2"
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Edit profile</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          ) : (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={cancelEditing}
                disabled={isSaving}
                aria-label="Cancel editing"
              >
                <X className="size-4" />
              </Button>

              <Button
                onClick={saveChanges}
                disabled={
                  isSaving ||
                  !draft.name.trim() ||
                  !draft.email.trim()
                }
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-primary/10 px-4 py-3 text-sm">
            <Check className="size-4 text-primary" />
            Profile changes saved successfully.
          </div>
        )}

        {/* Profile layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left profile sidebar */}
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl shadow-none">
              <div className="h-24 bg-primary/20">
                <div className="h-full w-full bg-gradient-to-br from-primary/30 to-transparent" />
              </div>

              <CardContent className="relative -mt-12 px-6 pb-6">
                <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-card bg-primary text-3xl font-semibold text-primary-foreground">
                  {initials}
                </div>

                <h2 className="mt-4 break-words text-xl font-semibold">
                  {profile.name || "Administrator"}
                </h2>

                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {profile.email}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Administrator account
                </div>

                <Separator className="my-5" />

                <nav className="space-y-1">
                  <a
                    href="#personal"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <UserRound className="size-4" />
                    <span className="flex-1">Personal information</span>
                    <ChevronRight className="size-4" />
                  </a>

                  <a
                    href="#contact"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Phone className="size-4" />
                    <span className="flex-1">Contact information</span>
                    <ChevronRight className="size-4" />
                  </a>
                </nav>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardContent className="flex gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Account security
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Your administrator access is managed through your authenticated account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right information sections */}
          <div className="min-w-0 space-y-6">
            <Card
              id="personal"
              className="scroll-mt-6 rounded-2xl shadow-none"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <UserRound className="size-5 text-primary" />
                  </div>

                  <div>
                    <CardTitle className="text-base">
                      Personal information
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your basic administrator details.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {field(
                  "name",
                  "Full name",
                  "Enter your full name",
                  UserRound
                )}

                {field(
                  "email",
                  "Email address",
                  "you@example.com",
                  Mail,
                  "email"
                )}
              </CardContent>
            </Card>

            <Card
              id="contact"
              className="scroll-mt-6 rounded-2xl shadow-none"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Phone className="size-5 text-primary" />
                  </div>

                  <div>
                    <CardTitle className="text-base">
                      Contact information
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Contact details associated with your account.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {field(
                  "phone",
                  "Phone number",
                  "Enter your phone number",
                  Phone,
                  "tel"
                )}
              </CardContent>
            </Card>

            {/* Bottom actions */}
            {isEditing && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  onClick={saveChanges}
                  disabled={
                    isSaving ||
                    !draft.name.trim() ||
                    !draft.email.trim()
                  }
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
