import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Provider, { userSignal } from "./components/Provider";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<ChatRoom />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

function ProtectedRoute() {
  const user = userSignal.value;
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return <Outlet />;
}

export default App;
