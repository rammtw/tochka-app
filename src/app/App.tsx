import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { TasksPage } from "@/pages/tasks";
import { WikiPage } from "@/pages/wiki";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TasksPage />} />
        <Route path="wiki" element={<WikiPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
