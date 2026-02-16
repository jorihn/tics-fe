import { PaymentStatus as PaymentStatusType } from "@/types/payment";

interface PaymentStatusProps {
  status: PaymentStatusType;
  message: string;
}

export function PaymentStatus({ status, message }: PaymentStatusProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "pending") {
    return (
      <div className="mt-4 rounded-xl border border-[#9aa2ff] bg-[#eef0ff] p-3 text-sm text-[#312e81]">
        Waiting for payment confirmation…
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div
      className={`mt-4 rounded-xl border p-3 text-sm ${
        isSuccess ? "border-emerald-300 bg-[#ebfff5] text-[#065f46]" : "border-rose-300 bg-[#fff1f1] text-[#9f1239]"
      }`}
    >
      {message}
    </div>
  );
}
