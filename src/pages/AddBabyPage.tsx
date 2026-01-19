import { useNavigate } from 'react-router-dom';
import { BabyForm } from '../components/BabyProfile';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';

export function AddBabyPage() {
  const navigate = useNavigate();
  const { addBaby } = useBabiesFirestore();

  const handleSubmit = async (data: Parameters<typeof addBaby>[0]) => {
    try {
      const newBaby = await addBaby(data);
      // Navigate to dashboard or baby profile after adding
      navigate(`/babies/${newBaby.id}`);
    } catch (error) {
      console.error('Failed to add baby:', error);
    }
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
