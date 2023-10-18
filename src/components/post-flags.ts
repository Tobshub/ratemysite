import type { PostFlags } from "@/server/api/tdb";

export const PostFlagNames: Record<PostFlags, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  login_required: "Login required",
  beginner: "Beginner",
  urgent: "Urgent",
};
