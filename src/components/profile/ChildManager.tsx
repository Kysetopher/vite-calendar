"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, Plus } from "lucide-react";

import { useRelationships } from "@/hooks/useRelationships";
import ChildForm, { childSchema, type ChildFormData } from "@/components/form/ChildForm";
import ChildCard from "@/components/profile/ChildCard";
import type { Child } from "@/utils/schema/relationship";

// import SimpleBar
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

function toChildPayload(data: ChildFormData) {
  const { first_name, last_name, ...rest } = data;
  const name = `${first_name}${last_name ? ` ${last_name}` : ""}`.trim();
  return { first_name, last_name, name, ...rest };
}

type ChildManagerProps = {
  className?: string;
};

export default function ChildManager({ className }: ChildManagerProps) {
  const { toast } = useToast();
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);

  const childForm = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      birthday: "",
      custody_percentage: 50,
      custody_arrangement: "joint",
      custody_schedule: "",
      school: "",
      grade: "",
      allergies: "",
      medications: "",
      emergency_contact: "",
      emergency_phone: "",
      notes: "",
      color: "#275559",
    },
  });

  const { childData = [], isLoading: childDataLoading, createChild } = useRelationships();

  const createChildMutation = useMutation({
    mutationFn: async (data: ChildFormData) => createChild(toChildPayload(data)),
    onSuccess: (_newChild: Child) => {
      setIsChildDialogOpen(false);
      childForm.reset();
      toast({ title: "Child added", description: "Child saved successfully." });
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
        description: "Failed to save child information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: ChildFormData) => {
    createChildMutation.mutate(data);
  };

  return (
 <Card className={cn("shadow flex h-full  min-h-0 flex-col", className)}>
       <CardHeader className="shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Baby className="w-5 h-5 mr-2" />
            Children
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsChildDialogOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>

            <ChildForm
              form={childForm}
              isOpen={isChildDialogOpen}
              onOpenChange={(open) => {
                setIsChildDialogOpen(open)
                if (!open) childForm.reset()
              }}
              onSubmit={onCreateSubmit}
              onCancel={() => {
                setIsChildDialogOpen(false)
                childForm.reset()
              }}
              editing={false}
              isSubmitting={createChildMutation.isPending}
            />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
        {childDataLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading children...</p>
          </div>
        ) : childData.length === 0 ? (
          <div className="text-center py-8">
            <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No children added yet</p>
            <p className="text-sm text-gray-400">
              Add your children's information to get started
            </p>
            <Button type="button" onClick={() => setIsChildDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first child
            </Button>
          </div>
        ) : (
          <SimpleBar style={{ height: '100%' }}>
   <div className="divide-y">
              {childData.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}
</div>
          </SimpleBar>
        )}
      </CardContent>
    </Card>
  )
}
