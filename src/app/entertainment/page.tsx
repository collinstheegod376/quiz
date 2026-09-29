import type { Metadata } from 'next';
import { EntertainmentScreen } from '@/components/screens/EntertainmentScreen';

export const metadata: Metadata = {
  title: 'Entertainment Quizzes — AniZuki',
  description:
    'Play 1000s of free entertainment quizzes, or create your own. Challenge your friends on any device. Stream friendly.',
};

export default function EntertainmentPage() {
  return <EntertainmentScreen />;
}
