import { useRouter } from 'next/router';
import { useState } from 'react';
import { mockCreateSub } from '../../data/mock';

type PaymentFormProps = {
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
};

export default function PaymentForm(props: PaymentFormProps) {
  const { disabled = true, setDisabled } = props;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    setIsLoading(true);
    setDisabled(true);
    await mockCreateSub(true);
    router.push('/checkout/123/success');
  };

  return (
    <div className="h-[170px] flex flex-col justify-center">
      <button
        disabled={disabled}
        onClick={onClick}
        className="items-center bg-blue-500 text-white font-semibold flex justify-center my-8 h-12 no-underline w-100 rounded-md border-none disabled:bg-blue-500/40"
      >
        {isLoading ? 'LOADING' : `Temporary submit`}
      </button>
    </div>
  );
}
