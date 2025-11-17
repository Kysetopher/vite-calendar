"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Trash2, Edit } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ChildForm, {
  childSchema,
  type ChildFormData,
} from "@/components/form/ChildForm";
import type { Child } from "@/utils/schema/relationship";
import { useRelationships } from "@/hooks/useRelationships";

function toChildPayload(data: ChildFormData) {
  const { first_name, last_name, ...rest } = data;
  const name = `${first_name}${last_name ? ` ${last_name}` : ""}`.trim();
  return { first_name, last_name, name, ...rest };
}

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const { toast } = useToast();
  const { updateChild, deleteChild } = useRelationships();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      first_name: child.first_name,
      last_name: child.last_name || "",
      birthday: child.birthday ? new Date(child.birthday).toISOString().split("T")[0] : "",
      custody_percentage: child.custody_percentage ?? 50,
      custody_arrangement: child.custody_arrangement ?? "joint",
      custody_schedule: child.custody_schedule ?? "",
      school: child.school ?? "",
      grade: child.grade ?? "",
      allergies: child.allergies ?? "",
      medications: child.medications ?? "",
      emergency_contact: child.emergency_contact ?? "",
      emergency_phone: child.emergency_phone ?? "",
      notes: child.notes ?? "",
      color: child.color ?? "#275559",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ChildFormData) => updateChild(child.id, toChildPayload(data)),
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({ title: "Child updated", description: "Saved successfully." });
    },
    onError: (error) => {
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
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteChild(child.id),
    onError: (error) => {
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
        description: "Failed to remove child. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Child removed", description: "Deleted successfully." });
    },
  });

  const openEdit = () => {
    // refresh defaults in case data changed upstream
    form.reset({
      first_name: child.first_name,
      last_name: child.last_name || "",
      birthday: child.birthday ? new Date(child.birthday).toISOString().split("T")[0] : "",
      custody_percentage: child.custody_percentage ?? 50,
      custody_arrangement: child.custody_arrangement ?? "joint",
      custody_schedule: child.custody_schedule ?? "",
      school: child.school ?? "",
      grade: child.grade ?? "",
      allergies: child.allergies ?? "",
      medications: child.medications ?? "",
      emergency_contact: child.emergency_contact ?? "",
      emergency_phone: child.emergency_phone ?? "",
      notes: child.notes ?? "",
      color: child.color ?? "#275559",
    });
    setIsDialogOpen(true);
  };

  const onDelete = () => {
    if (
      window.confirm("Are you sure you want to remove this child's information? This action cannot be undone.")
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {child.first_name} {child.last_name}
            </h3>
            {child.custody_arrangement && <Badge>{child.custody_arrangement}</Badge>}
            {typeof child.custody_percentage === "number" && (
              <Badge>{child.custody_percentage}% custody</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {child.birthday && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(child.birthday).toLocaleDateString()}
              </div>
            )}
            {child.school && (
              <div className="flex items-center">
                <span className="mr-1">🏫</span>
                {child.school} {child.grade && `(${child.grade})`}
              </div>
            )}
            {child.emergency_contact && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {child.emergency_contact} {child.emergency_phone}
              </div>
            )}
          </div>

          {child.custody_schedule && (
            <div className="mt-2">
              <p className="text-sm text-gray-700">
                <strong>Schedule:</strong> {child.custody_schedule}
              </p>
            </div>
          )}

          {(child.allergies || child.medications) && (
            <div className="mt-2 space-y-1">
              {child.allergies && (
                <p className="text-sm text-orange-700">
                  <strong>Allergies:</strong> {child.allergies}
                </p>
              )}
              {child.medications && (
                <p className="text-sm text-blue-700">
                  <strong>Medications:</strong> {child.medications}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant='ghost' type="button" onClick={openEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant='ghost'
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit dialog (ChildForm renders no trigger) */}
      <ChildForm
        form={form}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => updateMutation.mutate(data)}
        onCancel={() => setIsDialogOpen(false)}
        editing
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
