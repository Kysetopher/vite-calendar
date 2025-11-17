import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  PartyPopper,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils"; // merge helper

interface ProfileInfoCardProps {
  className?: string;
}

type ProfileUpdate = Partial<{
  first_name: string;
  last_name: string;
  birthday: string; // YYYY-MM-DD
  address: string;
  phone: string;
  email: string;
}>;

export default function ProfileInfoCard({ className }: ProfileInfoCardProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const [open, setOpen] = useState(false);
  const [birthday, setBirthday] = useState<Date | undefined>(
    profile?.birthday ? new Date(profile.birthday) : undefined
  );

  // inline name edit state
  const [isEditing, setIsEditing] = useState(false);
  const [nameForm, setNameForm] = useState<Pick<Required<ProfileUpdate>, "first_name" | "last_name">>({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
  });

  useEffect(() => {
    // keep name form in sync if profile changes or when entering edit mode
    if (isEditing) {
      setNameForm({
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
      });
    }
  }, [isEditing, profile?.first_name, profile?.last_name]);

  const [formData, setFormData] = useState<ProfileUpdate>({
    address: profile?.address || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
  });

  const handleError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => (window.location.href = "/api/login"), 500);
      return;
    }
    toast({
      title: "Error",
      description: "Failed to update profile. Please try again.",
      variant: "destructive",
    });
  };

  const updateField = async (payload: ProfileUpdate): Promise<boolean> => {
    try {
      setIsUpdating(true);
      await updateProfile(payload);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelect = async (date?: Date) => {
    if (!date) return;
    setBirthday(date);
    const birthdayStr = date.toISOString().split("T")[0];
    await updateField({ birthday: birthdayStr });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof ProfileUpdate;
    setFormData((s) => ({ ...s, [key]: e.target.value }));
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof ProfileUpdate;
    await updateField({ [key]: formData[key] } as ProfileUpdate);
  };


  const saveName = async () => {
    const success = await updateField({
      first_name: nameForm.first_name,
      last_name: nameForm.last_name,
    });
    if (success) setIsEditing(false);

  };

  const formattedBirthday = birthday
    ? birthday.toLocaleDateString(undefined, { timeZone: "UTC" })
    : "-";

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="h-[60px] flex-row border-b items-center gap-4 px-4">
        {isEditing ? (
          <div className="flex w-full items-center gap-2">
            <Input
              name="first_name"
              placeholder="First name"
              value={nameForm.first_name}
              onChange={(e) => setNameForm((s) => ({ ...s, first_name: e.target.value }))}
              disabled={isUpdating}
            />
            <Input
              name="last_name"
              placeholder="Last name"
              value={nameForm.last_name}
              onChange={(e) => setNameForm((s) => ({ ...s, last_name: e.target.value }))}
              disabled={isUpdating}
            />
            <Button size="sm" onClick={saveName} disabled={isUpdating}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"

              onClick={() =>  setIsEditing(false)}
              disabled={isUpdating}

            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <CardTitle className="flex-1">
              {profile?.first_name} {profile?.last_name}
              {(profile?.first_name || profile?.last_name) && `'s`} Profile
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Edit name"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 p-4">
        {/* Birthday (calendar only) */}
        <div className="flex items-center space-x-2">
          <PartyPopper className="h-5 w-5 text-muted-foreground" />
          <span>
            <span className="font-semibold">Birthday:</span> {formattedBirthday}
          </span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Edit birthday">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Calendar mode="single" selected={birthday} onSelect={handleSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Address */}
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Address"
            disabled={isUpdating}
          />
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-2">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Phone"
            disabled={isUpdating}
          />
        </div>

        {/* Email */}
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email"
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
