import { useRouter } from 'next/router';

type PaymentFormProps = {
  disabled: boolean;
};

export default function PaymentForm(props: PaymentFormProps) {
  const { disabled = true } = props;
  const router = useRouter();

  const onClick = () => {
    router.push('/checkout/123/success');
  };

  return (
    <div className="h-[400px] text-center leading-[400px]">
      Payment Form placeholder
      <button disabled={disabled} onClick={onClick}>
        Temporary submit
      </button>
    </div>
  );
}
