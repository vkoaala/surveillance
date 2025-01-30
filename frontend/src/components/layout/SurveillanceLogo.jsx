import { Link } from "react-router-dom";

const SurveillanceLogo = () => (
  <Link to="/" className="flex items-center space-x-2 text-4xl">
    <span>📡</span>
    <span className="text-[var(--color-primary)] font-bold">Surveillance</span>
  </Link>
);

export default SurveillanceLogo;
