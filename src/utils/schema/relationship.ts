import type { ApiUser } from "@/services/authService";

export interface CoParent {
  id: number;
  user_id: number;
  coparent_id: number;
  coparent_email: string;
  coparent_name: string;
  relationship_type: string;
  status: string;
  profile_image_url?: string;
}

export interface Child {
  id: number;
  first_name: string;
  last_name: string;
  birthday?: string;
  grade?: string;
  school?: string;
  custody_percentage?: number;
  medical_info?: string;
  allergies?: string;
  medications?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  personality_traits?: string;
  color?: string;

  //Not in API layer or database
  custody_arrangement?: string;
  custody_schedule?: string;
  notes?: string;
}

export interface  Adult {
  id: number;
  first_name: string;
  last_name?: string;
  relationship?:string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CoParentRelationship {
  id: number;
  user_id: number;
  coparent_id: number;
  relationship: string;
  status: string;
  can_view_events: boolean;
  can_create_events: boolean;
  can_edit_shared_events: boolean;
  created_at: string;
}

export interface InvitationResponse {
  id: number;
  inviter_id: number;
  inviter_email?: string;
  inviter_first_name?: string;
  inviter_last_name?: string;
  invitee_id?: number;
  invitee_email: string;
  invitee_first_name?: string;
  invitee_last_name?: string;
  invite_token: string;
  status: string;
  message?: string;
  created_at: string;
  expires_at: string;
  is_existing_user?: boolean;
  email_status?: string;
  inviter?: ApiUser;
  invitee?: ApiUser;
}

