// src/components/common/firebase-status-indicator.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

export function FirebaseStatusIndicator() {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting"
  );

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Attempt to read a collection. We don't need the data,
        // just to see if the call succeeds. We use a non-existent collection
        // name to avoid fetching actual data.
        await getDocs(collection(db, "_internal_status_check"));
        setStatus("connected");
      } catch (error) {
        console.error("Firebase connection check failed:", error);
        setStatus("error");
      }
    };

    checkConnection();
  }, []);

  if (status === "connecting") {
    return <Badge variant="outline">Menghubungkan ke Firebase...</Badge>;
  }

  if (status === "connected") {
    return <Badge className="bg-green-500 text-white hover:bg-green-600">Terhubung ke Firebase</Badge>;
  }

  return <Badge variant="destructive">Koneksi Firebase Gagal</Badge>;
}