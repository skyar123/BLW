import { useNavigate } from 'react-router-dom';
import { BabyForm } from '../components/BabyProfile';
import { useBabies } from '../hooks/useBabies';

export function AddBabyPage() {
  const navigate = useNavigate();
  const { addBaby } = useBabies();

  const handleSubmit = (data: Parameters<typeof addBaby>[0]) => {
    const newBaby = addBaby(data);
    // Navigate to dashboard or baby profile after adding
    navigate(`/babies/${newBaby.id}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-lg mx-auto pt-8">
        <BabyForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
