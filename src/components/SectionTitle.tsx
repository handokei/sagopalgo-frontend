import { Link } from 'react-router-dom';

interface SectionTitleProps {
  kicker?: string;
  title: string;
  moreTo?: string;
  moreLabel?: string;
}

const SectionTitle = ({ kicker, title, moreTo, moreLabel = '전체보기 →' }: SectionTitleProps) => {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      {kicker && (
        <span className="text-[11px] font-mono tracking-[0.08em] uppercase text-ink-soft">
          {kicker}
        </span>
      )}
      <h3 className="text-[22px] font-bold tracking-tightish">{title}</h3>
      {moreTo && (
        <Link to={moreTo} className="ml-auto text-[12px] text-ink-soft hover:text-ink">
          {moreLabel}
        </Link>
      )}
    </div>
  );
};

export default SectionTitle;
