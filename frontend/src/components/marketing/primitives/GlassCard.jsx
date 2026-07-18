// Marketing glass surface: existing .glass recipe + the 0.5px top light-catch
// that makes dark glass read as glass instead of mud.
export default function GlassCard({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`glass rounded-2xl shadow-[inset_0_0.5px_0_rgba(255,255,255,0.10),0_10px_30px_rgba(0,0,0,0.35)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
