interface FeedbackProps {
  message: string;
}

export default function Feedback({ message }: FeedbackProps) {
  return (
    <div className="rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600" role="alert">
      {message}
    </div>
  );
}