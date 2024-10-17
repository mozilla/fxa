import { LoadingSpinner } from '@fxa/payments/ui';

export default function GenericLoading() {
  return (
    <div className="flex justify-center items-center fixed inset-0">
      <LoadingSpinner className="h-10" />
    </div>
  );
}
