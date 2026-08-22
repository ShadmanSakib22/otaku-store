"use client";

import { logoutAction } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => logoutAction()}>
      Log Out
    </Button>
  );
}
