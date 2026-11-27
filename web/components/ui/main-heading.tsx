import FlipText from "./flip-text";

export default function HeroHeader() {
  return (
    <h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.03em] text-[#1B171C] dark:text-[#EDE7DC] leading-[1.12] sm:text-6xl">
      <FlipText duration={3} delay={0.1}>
        The Transparent Paid Leaderboard for
      </FlipText>{" "}
      <FlipText
        duration={3}
        delay={0.45}
        className="text-[#FF4D1F]"
      >
        Indian Businesses.
      </FlipText>
    </h1>
  );
}
