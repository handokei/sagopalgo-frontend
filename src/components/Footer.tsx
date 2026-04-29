const Footer = () => {
  return (
    <footer className="border-t border-line mt-12">
      <div className="max-w-content mx-auto px-8 py-6 flex items-center justify-between text-[11px] text-ink-faint font-mono">
        <span>&copy; 사고팔고</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-ink">이용약관</a>
          <a href="#" className="hover:text-ink">개인정보처리방침</a>
          <a href="#" className="hover:text-ink">고객센터</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
