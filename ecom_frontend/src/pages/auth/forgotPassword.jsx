import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "./authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email required");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({ email });

      toast.success("Reset link sent to email 🚀");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bg" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="box">
          <h1>Forgot Password</h1>
          <p>Enter your email to reset your password</p>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button className="btn" onClick={handleSubmit} loading={loading}>
            Send Reset Link
          </Button>

          <p className="back" onClick={() => navigate("/")}>
            Back to Login
          </p>
        </div>
      </motion.div>

      <style>{`
        .page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
          position: relative;
          background: #000;
          padding: 20px;
        }

        .bg {
          position: absolute;
          inset: 0;
          background-image: url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          filter: blur(10px);
          transform: scale(1.1);
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px;
          z-index: 2;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .box h1 {
          font-size: 26px;
          margin-bottom: 10px;
        }

        .box p {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .field {
          margin-bottom: 20px;
        }

        label {
          font-size: 12px;
          color: #374151;
        }

        input {
          width: 100%;
          padding: 12px;
          margin-top: 6px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        .btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
        }

        .back {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #3b82f6;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}