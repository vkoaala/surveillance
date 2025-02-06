//import { Link } from "react-router-dom";
//
//const SurveillanceLogo = () => (
//  <Link to="/" className="flex items-center space-x-2 text-4xl">
//    <span>📡</span>
//    <span className="text-[var(--color-primary)] font-bold">Surveillance</span>
//  </Link>
//);
//
//export default SurveillanceLogo;
import { Link } from "react-router-dom";
import logo from "@/assets/surveillance_logo.png";

const SurveillanceLogo = () => (
  <Link to="/" className="flex items-center space-x-2">
    <div
      className="w-16 h-16"
      style={{
        WebkitMaskImage: `url(${logo})`,
        maskImage: `url(${logo})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "var(--color-primary)",
      }}
    />
    <span className="text-[var(--color-primary)] font-bold text-3xl">
      Surveillance
    </span>
  </Link>
);

export default SurveillanceLogo;
