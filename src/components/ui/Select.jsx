export default function Select({ className = '', children, ...rest }) {
  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  );
}
