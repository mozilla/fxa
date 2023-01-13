type PaymentFormProps = {
  disabled: boolean;
};

export default function PaymentForm(props: PaymentFormProps) {
  const { disabled = true } = props;
  return (
    <div className="h-[400px] text-center leading-[400px]">
      Payment Form placeholder
      <button disabled={disabled}>Temporary submit</button>
    </div>
  );
}
