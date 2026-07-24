export default function TextArea({ className = '', large = false, ...rest }) {
  return (
    <textarea
      className={`textarea ${large ? 'textarea--lg' : ''} ${className}`}
      {...rest}
    />
  );
}
