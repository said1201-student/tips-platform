"use client";

import { useEffect } from "react";
import api from "@/lib/api";

export default function ViewTracker({ tipId }) {
  useEffect(() => {
    api.post(`/tips/${tipId}/view`).catch(() => {});
  }, [tipId]);
  return null;
}
