import { Link } from "react-router-dom";

export const HeaderLogo = () => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 group cursor-pointer z-10"
      aria-label="Home"
    >
      <img
        src="/logo.svg"
        alt="Sahin Alam"
        className="w-8 h-8 sm:w-10 sm:h-10"
      />
    </Link>
  );
};
