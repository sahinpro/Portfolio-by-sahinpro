export const ProfileImage = () => (
  <div className="flex items-center justify-center mb-2">
    <img
      src="/sahin.webp"
      alt="Sahin Alam"
      width={250}
      height={250}
      loading="lazy"
      decoding="async"
      className="w-[250px] h-[250px] rounded-full object-cover border-4 border-white/20 shadow-lg"
    />
  </div>
);
