export interface User {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  auth0_id?: string;
  phone?: string;
  address?: string;
  birthday?: Date | null;
  relationship_history?: string;
  communication_goals?: string;
  communication_style?: string;
  main_concerns?: string;
  co_parenting_priorities?: string;
  biggest_challenges?: string;
  successful_strategies: string;
}

