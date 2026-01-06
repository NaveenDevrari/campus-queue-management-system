import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GuestEntry() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const enterViaQr = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/guest/entry/${qrId}`,
          { withCredentials: true }
        );

        const redirectUrl = res.data.redirectUrl;
        const hashPath = redirectUrl.split("#")[1];
        navigate(hashPath, { replace: true });

      } catch (err) {
        alert(err.response?.data?.message || "QR expired or invalid");
        navigate("/", { replace: true });
      }
    };

    enterViaQr();
  }, [qrId, navigate]);

  return (
    <div className="flex items-center justify-center h-[70vh] text-slate-300">
      <p className="animate-pulse text-lg">
        Processing QR… Please wait
      </p>
    </div>
  );
}
