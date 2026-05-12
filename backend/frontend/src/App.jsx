import { lazy, Suspense } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NodeDetailsPage = lazy(() => import("./pages/NodeDetailsPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <Stack minHeight="100vh" alignItems="center" justifyContent="center">
          <CircularProgress color="primary" />
        </Stack>
      }
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/nodes/:nodeId" element={<NodeDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
