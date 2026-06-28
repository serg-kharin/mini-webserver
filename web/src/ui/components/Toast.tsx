interface Props {
  message: string
  onClose: () => void
}

// Non-blocking notification banner; replaces native alert().
export default function Toast({ message, onClose }: Props) {
  return (
    <div className="toast" role="alert">
      <span>{message}</span>
      <button className="close" aria-label="close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
