import { useDispatch } from "react-redux";
import { loginUser } from "./authService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      name: "ZYNO",
      subtitle: "Smart Ecommerce Admin Panel",
      leftBg: "linear-gradient(135deg, #3b82f6, #6366f1)",
      bgImage:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "ZYNO",
      subtitle: "Modern Analytics Dashboard",
      leftBg: "linear-gradient(135deg, #f97316, #ef4444)",
      bgImage:
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "ZYNO",
      subtitle: "AI Powered Admin Experience",
      leftBg: "linear-gradient(135deg, #10b981, #06b6d4)",
      bgImage:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    },
  ];
  const current = slides[activeSlide];

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email().required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await loginUser(values);

        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));

        dispatch({
          type: "auth/setUser",
          payload: res.data.data.user,
        });

        toast.success("Welcome back");
        navigate("/dashboard");
      } catch (err) {
        toast.error("Login failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="page">
      {/* BACKGROUND */}
      <div
        className="bg"
        style={{
          backgroundImage: `url(${current.bgImage})`,
        }}
      >
        <div className="overlay" />
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        {/* LEFT */}
        <div className="left" style={{ background: current.leftBg }}>
          <h1>{current.name}</h1>
          <p>{current.subtitle}</p>

          <div className="dots">
            {slides.map((_, i) => (
              <span
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{
                  opacity: activeSlide === i ? 1 : 0.4,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <form className="right" onSubmit={formik.handleSubmit}>
          <h2>Sign in</h2>
          <p className="sub">Welcome back! Please login to continue</p>

          {/* EMAIL */}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="error">{formik.errors.email}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="field">
            <label>Password</label>
            <div className="pass">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="eye"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {formik.touched.password && formik.errors.password && (
              <span className="error">{formik.errors.password}</span>
            )}
          </div>

          <div className="row">
            <span onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </span>
          </div>

          <Button className="btn" type="submit" loading={loading}>
            Sign in
          </Button>

          <p className="footer">© 2026 ZYNO</p>
        </form>
      </motion.div>

      {/* STYLE */}
      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 20px;
          background: #000;
        }

        /* BACKGROUND */
        .bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: blur(12px);
          transform: scale(1.1);
          transition: all 0.6s ease;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(59,130,246,0.4), transparent 40%),
            linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7));
        }

        /* CARD */
        .card {
          width: clamp(320px, 90%, 850px);
          display: flex;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.25);
          z-index: 2;
        }

        /* LEFT */
        .left {
          flex: 1;
          padding: clamp(20px, 4vw, 50px);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: background 0.6s ease;
        }

        .left h1 {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
        }

        .left p {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 10px;
        }

        .dots {
          margin-top: 25px;
          display: flex;
          gap: 8px;
        }

        .dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          transition: 0.3s;
        }

        /* RIGHT */
        .right {
          flex: 1;
          padding: clamp(20px, 4vw, 50px);
        }

        .right h2 {
          font-size: 24px;
        }

        .sub {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 25px;
        }

        .field {
          margin-bottom: 15px;
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

        .pass {
          position: relative;
        }

        .eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          cursor: pointer;
          color: #3b82f6;
        }

        .row {
          text-align: right;
          font-size: 12px;
          color: #3b82f6;
          margin-bottom: 15px;
          cursor: pointer;
        }

        .btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
        }

        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 11px;
          color: #9ca3af;
        }

        .error {
          font-size: 11px;
          color: red;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .card {
            flex-direction: column;
            width: 95%;
          }

          .left, .right {
            padding: 25px;
          }
        }

        @media (max-width: 480px) {
          .right h2 {
            font-size: 20px;
          }

          input {
            padding: 10px;
          }

          .btn {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}