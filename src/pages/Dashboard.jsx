import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") navigate("/admindashboard", { replace: true });
    else if (role === "manager")
      navigate("/managerdashboard", { replace: true });
    else navigate("/userdashboard", { replace: true });
  }, [role, navigate]);

  return null;
};

export default Dashboard;
