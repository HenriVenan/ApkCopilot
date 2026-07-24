export default function Input({ className = '', ...rest }) {
  return <input className={`input ${className}`} {...rest} />;
}
